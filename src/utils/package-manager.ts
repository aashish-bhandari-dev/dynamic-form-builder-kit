import fs from 'fs';
import path from 'path';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export function detectPackageManager(projectRoot: string): PackageManager {
    if (fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(projectRoot, 'yarn.lock'))) return 'yarn';
    if (
        fs.existsSync(path.join(projectRoot, 'bun.lock')) ||
        fs.existsSync(path.join(projectRoot, 'bun.lockb'))
    ) {
        return 'bun';
    }
    return 'npm';
}

export function getInstallCommand(
    pm: PackageManager,
    packages: string[],
): { command: string; args: string[] } {
    switch (pm) {
        case 'pnpm':
            return { command: 'pnpm', args: ['add', ...packages] };
        case 'yarn':
            return { command: 'yarn', args: ['add', ...packages] };
        case 'bun':
            return { command: 'bun', args: ['add', ...packages] };
        default:
            return { command: 'npm', args: ['install', ...packages] };
    }
}

export function getExecuteCommand(
    pm: PackageManager,
    args: string[],
): { command: string; args: string[] } {
    switch (pm) {
        case 'pnpm':
            return { command: 'pnpm', args: ['dlx', ...args] };
        case 'yarn':
            return { command: 'yarn', args: ['dlx', ...args] };
        case 'bun':
            return { command: 'bunx', args: ['--bun', ...args] };
        default:
            return { command: 'npx', args };
    }
}
