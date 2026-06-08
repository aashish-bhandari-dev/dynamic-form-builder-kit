import fs from 'fs-extra';
import path from 'path';
import {
    FORM_BUILDER_COMPONENT_FILES,
    FORM_BUILDER_TYPES_FILE,
    FORM_BUILDER_UTILS_FILE,
} from '../registry-manifest';
import {
    findProjectRoot,
    getFormBuilderTargetDir,
    getPackageRegistryComponentsDir,
    getPackageRegistrySupportingDir,
    getPackageRoot,
    getLibDirectory,
    getTypesDirectory,
    getTypesFilePath,
    getUtilsFilePath,
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

function getInstalledPaths(projectRoot: string, componentDir: string) {
    return [
        ...FORM_BUILDER_COMPONENT_FILES.map((file) => path.join(componentDir, file)),
        getTypesFilePath(projectRoot, FORM_BUILDER_TYPES_FILE),
        getUtilsFilePath(projectRoot, FORM_BUILDER_UTILS_FILE),
    ];
}

export async function addFormBuilder(options: AddOptions = {}): Promise<void> {
    const projectRoot = findProjectRoot(options.cwd ?? process.cwd());
    const targetDir = options.path
        ? path.resolve(projectRoot, options.path)
        : getFormBuilderTargetDir(projectRoot);

    const packageRoot = getPackageRoot();
    const registryComponentsDir = getPackageRegistryComponentsDir(packageRoot);
    const registrySupportingDir = getPackageRegistrySupportingDir(packageRoot);

    if (!fs.existsSync(registryComponentsDir)) {
        throw new Error(
            `Registry not found at ${registryComponentsDir}. Reinstall dynamic-form-builder-kit or run from the package source.`,
        );
    }

    const typesDest = getTypesFilePath(projectRoot, FORM_BUILDER_TYPES_FILE);
    const utilsDest = getUtilsFilePath(projectRoot, FORM_BUILDER_UTILS_FILE);

    const existing = getInstalledPaths(projectRoot, targetDir).filter((filePath) =>
        fs.existsSync(filePath),
    );

    if (existing.length > 0 && !options.force) {
        const relative = existing.map((f) => path.relative(projectRoot, f).replace(/\\/g, '/'));
        throw new Error(
            `Form builder already installed (${relative.join(', ')}). Use --force to overwrite.`,
        );
    }

    await fs.ensureDir(targetDir);
    await fs.ensureDir(getTypesDirectory(projectRoot));
    await fs.ensureDir(getLibDirectory(projectRoot));

    for (const file of FORM_BUILDER_COMPONENT_FILES) {
        const source = path.join(registryComponentsDir, file);
        const dest = path.join(targetDir, file);
        if (!fs.existsSync(source)) {
            throw new Error(`Missing registry file: ${source}`);
        }
        await fs.copy(source, dest, { overwrite: true });
    }

    const typesSource = path.join(registrySupportingDir, FORM_BUILDER_TYPES_FILE);
    const utilsSource = path.join(registrySupportingDir, FORM_BUILDER_UTILS_FILE);

    if (!fs.existsSync(typesSource)) {
        throw new Error(`Missing registry file: ${typesSource}`);
    }
    if (!fs.existsSync(utilsSource)) {
        throw new Error(`Missing registry file: ${utilsSource}`);
    }

    await fs.copy(typesSource, typesDest, { overwrite: true });
    await fs.copy(utilsSource, utilsDest, { overwrite: true });

    const relativeTarget = path.relative(projectRoot, targetDir).replace(/\\/g, '/');
    const relativeTypes = path.relative(projectRoot, typesDest).replace(/\\/g, '/');
    const relativeUtils = path.relative(projectRoot, utilsDest).replace(/\\/g, '/');

    console.log('\n✔ Form builder components installed to', relativeTarget);
    console.log('✔ Types installed to', relativeTypes);
    console.log('✔ Utils installed to', relativeUtils);

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
    console.log(`  import { FormBuilder } from '@/components/form-builder/FormBuilder';`);
    console.log(`  import type { FormPayload } from '@/types/form-builder.types';\n`);
    console.log('  Provide onSave to persist form schemas to your API.\n');
}
