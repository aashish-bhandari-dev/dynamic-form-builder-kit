import fs from 'fs';
import path from 'path';
import { NPM_DEPENDENCIES, SHADCN_COMPONENTS } from '../registry-manifest';
import { getComponentsAlias, resolveAliasPath } from './paths';

export type DependencyAudit = {
    missingNpm: string[];
    missingShadcn: string[];
    hasComponentsJson: boolean;
    uiDir: string;
};

type PackageJson = {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
};

function readPackageJson(projectRoot: string): PackageJson {
    const pkgPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) return {};
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as PackageJson;
}

export function getUiComponentsDir(projectRoot: string): string {
    const componentsAlias = getComponentsAlias(projectRoot);
    const componentsDir = resolveAliasPath(projectRoot, componentsAlias);
    return path.join(componentsDir, 'ui');
}

function isNpmPackageInstalled(projectRoot: string, name: string, pkgJson: PackageJson): boolean {
    const declared = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies,
        ...pkgJson.optionalDependencies,
    };
    if (declared && name in declared) return true;
    return fs.existsSync(path.join(projectRoot, 'node_modules', name, 'package.json'));
}

function shadcnComponentExists(uiDir: string, name: string): boolean {
    const candidates = [
        path.join(uiDir, `${name}.tsx`),
        path.join(uiDir, `${name}.ts`),
        path.join(uiDir, `${name}.jsx`),
        path.join(uiDir, `${name}`, 'index.tsx'),
        path.join(uiDir, `${name}`, 'index.ts'),
    ];
    return candidates.some((candidate) => fs.existsSync(candidate));
}

export function auditDependencies(projectRoot: string): DependencyAudit {
    const pkgJson = readPackageJson(projectRoot);
    const uiDir = getUiComponentsDir(projectRoot);
    const hasComponentsJson = fs.existsSync(path.join(projectRoot, 'components.json'));

    const missingNpm = NPM_DEPENDENCIES.filter(
        (pkg) => !isNpmPackageInstalled(projectRoot, pkg, pkgJson),
    );

    const missingShadcn = SHADCN_COMPONENTS.filter(
        (component) => !shadcnComponentExists(uiDir, component),
    );

    return { missingNpm, missingShadcn, hasComponentsJson, uiDir };
}

export function hasMissingDependencies(audit: DependencyAudit): boolean {
    return audit.missingNpm.length > 0 || audit.missingShadcn.length > 0;
}
