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
    if (!alias.startsWith('@/')) {
        return path.join(projectRoot, alias);
    }

    const subPath = alias.slice(2);
    const tsconfig = readTsConfig(projectRoot);
    const pathKey = tsconfig?.compilerOptions?.paths?.['@/*']?.[0];

    if (pathKey) {
        const base = pathKey.replace(/\/\*$/, '').replace(/^\.\//, '');
        return path.join(projectRoot, base, subPath);
    }

    if (fs.existsSync(path.join(projectRoot, 'src'))) {
        return path.join(projectRoot, 'src', subPath);
    }

    return path.join(projectRoot, subPath);
}

export function getComponentsAlias(projectRoot: string): string {
    const componentsJsonPath = path.join(projectRoot, 'components.json');
    if (fs.existsSync(componentsJsonPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf8')) as {
                aliases?: { components?: string };
            };
            if (config.aliases?.components) {
                return config.aliases.components;
            }
        } catch {
            // fall through
        }
    }
    return '@/components';
}

export function getFormBuilderTargetDir(
    projectRoot: string,
    subdir: string = 'form-builder',
): string {
    const componentsAlias = getComponentsAlias(projectRoot);
    const componentsDir = resolveAliasPath(projectRoot, componentsAlias);
    return path.join(componentsDir, subdir);
}

export function getPackageRegistryDir(packageRoot: string): string {
    return path.join(packageRoot, 'registry', 'default', 'form-builder');
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
    throw new Error('Could not find dynamic-form-builder package root (registry missing).');
}
