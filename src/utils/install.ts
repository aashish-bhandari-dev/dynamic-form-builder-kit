import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { DependencyAudit } from './dependencies';
import { auditDependencies } from './dependencies';
import { detectPackageManager, getInstallCommand } from './package-manager';

function run(command: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });

        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command exited with code ${code}: ${command} ${args.join(' ')}`));
        });
    });
}

export async function installNpmPackages(
    projectRoot: string,
    packages: string[],
): Promise<void> {
    if (packages.length === 0) return;

    const pm = detectPackageManager(projectRoot);
    const { command, args } = getInstallCommand(pm, packages);

    console.log(`\n→ Installing npm packages (${pm}): ${packages.join(', ')}`);
    await run(command, args, projectRoot);
    console.log('✔ npm packages installed');
}

export async function ensureShadcnInitialized(projectRoot: string): Promise<boolean> {
    if (fs.existsSync(path.join(projectRoot, 'components.json'))) {
        return true;
    }

    console.log('\n→ Initializing shadcn/ui (components.json not found)...');
    await run('npx', ['shadcn@latest', 'init', '--defaults', '--yes'], projectRoot);

    const initialized = fs.existsSync(path.join(projectRoot, 'components.json'));
    if (initialized) {
        console.log('✔ shadcn/ui initialized');
    }
    return initialized;
}

export async function installShadcnComponents(
    projectRoot: string,
    components: string[],
): Promise<void> {
    if (components.length === 0) return;

    console.log(`\n→ Installing shadcn/ui components: ${components.join(', ')}`);
    await run('npx', ['shadcn@latest', 'add', ...components, '--yes'], projectRoot);
    console.log('✔ shadcn/ui components installed');
}

export async function installMissingDependencies(
    projectRoot: string,
    audit: DependencyAudit,
): Promise<void> {
    if (audit.missingNpm.length > 0) {
        await installNpmPackages(projectRoot, audit.missingNpm);
    }

    let shadcnToInstall = audit.missingShadcn;
    if (shadcnToInstall.length === 0) return;

    if (!audit.hasComponentsJson) {
        const ready = await ensureShadcnInitialized(projectRoot);
        if (!ready) {
            console.warn('\n⚠ Could not initialize shadcn/ui.');
            console.warn('  Run: npx shadcn@latest init --defaults --yes');
            console.warn(
                `  Then: npx shadcn@latest add ${shadcnToInstall.join(' ')} --yes`,
            );
            return;
        }
        shadcnToInstall = auditDependencies(projectRoot).missingShadcn;
    }

    if (shadcnToInstall.length > 0) {
        await installShadcnComponents(projectRoot, shadcnToInstall);
    }
}

export function printMissingDependencies(projectRoot: string, audit: DependencyAudit): void {
    if (audit.missingNpm.length === 0 && audit.missingShadcn.length === 0) return;

    console.log('\nMissing dependencies:\n');

    if (audit.missingNpm.length > 0) {
        console.log('  npm:', audit.missingNpm.join(', '));
        const pm = detectPackageManager(projectRoot);
        const { command, args } = getInstallCommand(pm, [...audit.missingNpm]);
        console.log(`  → ${command} ${args.join(' ')}\n`);
    }

    if (audit.missingShadcn.length > 0) {
        console.log('  shadcn:', audit.missingShadcn.join(', '));
        if (!audit.hasComponentsJson) {
            console.log('  → npx shadcn@latest init --defaults --yes');
        }
        console.log(
            `  → npx shadcn@latest add ${audit.missingShadcn.join(' ')} --yes\n`,
        );
    }
}
