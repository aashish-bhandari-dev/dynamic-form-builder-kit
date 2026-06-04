import fs from 'fs-extra';
import path from 'path';
import { FORM_BUILDER_FILES } from '../registry-manifest';
import {
    findProjectRoot,
    getFormBuilderTargetDir,
    getPackageRegistryDir,
    getPackageRoot,
} from '../utils/paths';
import { auditDependencies, hasMissingDependencies } from '../utils/dependencies';
import { promptAndInstallDependencies } from '../utils/prompt-install';

export type AddOptions = {
    cwd?: string;
    force?: boolean;
    path?: string;
    yes?: boolean;
    skipDeps?: boolean;
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

    const audit = auditDependencies(projectRoot);

    if (!hasMissingDependencies(audit)) {
        console.log('✔ All required dependencies are already installed.\n');
    } else {
        await promptAndInstallDependencies({
            projectRoot,
            audit,
            yes: options.yes,
            skipDeps: options.skipDeps,
        });

        const updatedAudit = auditDependencies(projectRoot);
        if (!hasMissingDependencies(updatedAudit)) {
            console.log('✔ All required dependencies are now installed.\n');
        }
    }

    console.log('\nUse the builder in your app:');
    console.log(`  import { FormBuilder } from '@/components/form-builder/FormBuilder';\n`);
    console.log(`  (files at: ${relativeTarget}/)\n`);
    console.log('  Provide onSave to persist form schemas to your API.\n');
}
