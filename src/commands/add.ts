import fs from 'fs-extra';
import path from 'path';
import { FORM_BUILDER_FILES, NPM_DEPENDENCIES, SHADCN_COMPONENTS } from '../registry-manifest';
import {
    findProjectRoot,
    getFormBuilderTargetDir,
    getPackageRegistryDir,
    getPackageRoot,
} from '../utils/paths';

export type AddOptions = {
    cwd?: string;
    force?: boolean;
    path?: string;
};

export async function addFormBuilder(options: AddOptions = {}): Promise<void> {
    const projectRoot = findProjectRoot(options.cwd ?? process.cwd());
    const targetDir = options.path
        ? path.resolve(projectRoot, options.path)
        : getFormBuilderTargetDir(projectRoot);

    const registryDir = getPackageRegistryDir(getPackageRoot());

    if (!fs.existsSync(registryDir)) {
        throw new Error(
            `Registry not found at ${registryDir}. Reinstall dynamic-form-builder or run from the package source.`,
        );
    }

    await fs.ensureDir(targetDir);

    const existing = FORM_BUILDER_FILES.filter((file) =>
        fs.existsSync(path.join(targetDir, file)),
    );

    if (existing.length > 0 && !options.force) {
        throw new Error(
            `Form builder already exists at ${targetDir} (${existing.join(', ')}). Use --force to overwrite.`,
        );
    }

    for (const file of FORM_BUILDER_FILES) {
        const source = path.join(registryDir, file);
        const dest = path.join(targetDir, file);
        if (!fs.existsSync(source)) {
            throw new Error(`Missing registry file: ${source}`);
        }
        await fs.copy(source, dest, { overwrite: true });
    }

    const relativeTarget = path.relative(projectRoot, targetDir).replace(/\\/g, '/');

    console.log('\n✔ Form builder installed to', relativeTarget);
    console.log('\nNext steps:\n');
    console.log('1. Install shadcn/ui components (if not already present):');
    console.log(`   npx shadcn@latest add ${SHADCN_COMPONENTS.join(' ')}\n`);
    console.log('2. Install npm dependencies:');
    console.log(`   npm install ${NPM_DEPENDENCIES.join(' ')}\n`);
    console.log('3. Use the builder in your app:');
    console.log(`   import { FormBuilder } from '@/components/form-builder/FormBuilder';\n`);
    console.log(`   (files were written to: ${relativeTarget}/)\n`);
    console.log('   Provide onSave to persist form schemas to your API.\n');
}
