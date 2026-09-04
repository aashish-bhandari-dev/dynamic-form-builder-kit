import fs from 'fs';
import path from 'path';

export function findProjectRoot(startDir: string = process.cwd()): string {
    let dir = startDir;
    while (true) {
        if (fs.existsSync(path.join(dir, 'package.json'))) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return startDir;
        }
        dir = parent;
    }
}

type TsConfig = {
    compilerOptions?: {
        paths?: Record<string, string[]>;
    };
};

function readTsConfig(projectRoot: string): TsConfig | null {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
        return null;
    }
    try {
        const raw = fs.readFileSync(tsconfigPath, 'utf8');
        const withoutComments = raw.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
        return JSON.parse(withoutComments) as TsConfig;
    } catch {
        return null;
    }
}

/** Resolve `@/components` (or similar) to a filesystem path under the project root. */
export function resolveAliasPath(projectRoot: string, alias: string): string {
    const prefix = alias.startsWith('@/') ? '@/' : alias.startsWith('~/') ? '~/' : null;

    if (!prefix) {
        return path.join(projectRoot, alias);
    }

    const subPath = alias.slice(2);
    const tsconfig = readTsConfig(projectRoot);
    const pathKey = tsconfig?.compilerOptions?.paths?.[`${prefix}*`]?.[0];

    if (pathKey) {
        const base = pathKey.replace(/\/\*$/, '').replace(/^\.\//, '');
        return path.join(projectRoot, base, subPath);
    }

    if (fs.existsSync(path.join(projectRoot, 'src'))) {
        return path.join(projectRoot, 'src', subPath);
    }

    return path.join(projectRoot, subPath);
}

type ComponentsJsonConfig = {
    tsx?: boolean;
    aliases?: {
        components?: string;
        lib?: string;
        ui?: string;
    };
};

function readComponentsJson(projectRoot: string): ComponentsJsonConfig | null {
    const componentsJsonPath = path.join(projectRoot, 'components.json');
    if (!fs.existsSync(componentsJsonPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(componentsJsonPath, 'utf8')) as ComponentsJsonConfig;
    } catch {
        return null;
    }
}

export function isTsxProject(projectRoot: string): boolean {
    const config = readComponentsJson(projectRoot);
    if (config && config.tsx === false) {
        return false;
    }
    return fs.existsSync(path.join(projectRoot, 'tsconfig.json'));
}

export function getAliasPrefix(projectRoot: string): string {
    const componentsAlias = getComponentsAlias(projectRoot);
    if (componentsAlias.startsWith('~/')) return '~/';
    if (componentsAlias.startsWith('@/')) return '@/';
    return '@/';
}

export function getComponentsAlias(projectRoot: string): string {
    return readComponentsJson(projectRoot)?.aliases?.components ?? '@/components';
}

export function getUiAlias(projectRoot: string): string {
    return readComponentsJson(projectRoot)?.aliases?.ui ?? `${getComponentsAlias(projectRoot)}/ui`;
}

export function getLibAlias(projectRoot: string): string {
    return readComponentsJson(projectRoot)?.aliases?.lib ?? `${getAliasPrefix(projectRoot)}lib`;
}

export function getTypesAlias(projectRoot: string): string {
    return `${getAliasPrefix(projectRoot)}types`;
}

/** `types/` at project root, or existing `src/types` if present. */
export function getTypesDirectory(projectRoot: string): string {
    const typesAlias = getTypesAlias(projectRoot);
    const resolved = resolveAliasPath(projectRoot, typesAlias);
    if (fs.existsSync(resolved)) {
        return resolved;
    }

    const rootTypes = path.join(projectRoot, 'types');
    if (fs.existsSync(rootTypes)) {
        return rootTypes;
    }

    const srcTypes = path.join(projectRoot, 'src', 'types');
    if (fs.existsSync(srcTypes)) {
        return srcTypes;
    }

    return resolved;
}

export function getTypesFilePath(projectRoot: string, fileName: string): string {
    return path.join(getTypesDirectory(projectRoot), fileName);
}

export function getLibDirectory(projectRoot: string): string {
    const libAlias = getLibAlias(projectRoot);
    return resolveAliasPath(projectRoot, libAlias);
}

export function getUtilsFilePath(projectRoot: string, fileName: string): string {
    return path.join(getLibDirectory(projectRoot), fileName);
}

export function getFormBuilderTargetDir(
    projectRoot: string,
    subdir: string = 'form-builder',
): string {
    const componentsAlias = getComponentsAlias(projectRoot);
    const componentsDir = resolveAliasPath(projectRoot, componentsAlias);
    return path.join(componentsDir, subdir);
}

export function getPackageRegistryComponentsDir(packageRoot: string): string {
    return path.join(packageRoot, 'registry', 'default', 'form-builder');
}

export function getPackageRegistrySupportingDir(packageRoot: string): string {
    return path.join(packageRoot, 'registry', 'default');
}

export function getPackageRoot(): string {
    let dir = __dirname;
    while (dir !== path.dirname(dir)) {
        if (
            fs.existsSync(path.join(dir, 'package.json')) &&
            fs.existsSync(path.join(dir, 'registry'))
        ) {
            return dir;
        }
        dir = path.dirname(dir);
    }
    throw new Error('Could not find dynamic-form-builder-kit package root (registry missing).');
}
