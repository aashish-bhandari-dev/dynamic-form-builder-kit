import prompts from 'prompts';
import type { DependencyAudit } from './dependencies';
import { installMissingDependencies, printMissingDependencies } from './install';
import { colors } from './colors';

export type PromptInstallOptions = {
    projectRoot: string;
    audit: DependencyAudit;
    yes?: boolean;
    skipDeps?: boolean;
};

export async function promptAndInstallDependencies(
    options: PromptInstallOptions,
): Promise<void> {
    const { projectRoot, audit, yes, skipDeps } = options;

    if (skipDeps) {
        printMissingDependencies(projectRoot, audit);
        return;
    }

    if (yes) {
        await installMissingDependencies(projectRoot, audit);
        return;
    }

    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
    if (!isInteractive) {
        console.log(`\n${colors.dim('Non-interactive terminal — skipping auto-install.')}`);
        printMissingDependencies(projectRoot, audit);
        console.log(`Re-run with ${colors.cyan('--yes')} to install automatically.\n`);
        return;
    }

    const lines: string[] = [];
    if (audit.missingNpm.length > 0) {
        lines.push(`${colors.bold('npm:')} ${audit.missingNpm.join(', ')}`);
    }
    if (audit.missingShadcn.length > 0) {
        lines.push(`${colors.bold('shadcn:')} ${audit.missingShadcn.join(', ')}`);
    }
    if (!audit.hasComponentsJson && audit.missingShadcn.length > 0) {
        lines.push(colors.dim('(will run shadcn init, then add missing components)'));
    }

    console.log(`\n${colors.yellow('The following dependencies are required:')}\n`);
    for (const line of lines) {
        console.log(`  • ${line}`);
    }
    console.log('');

    const { install } = await prompts({
        type: 'confirm',
        name: 'install',
        message: 'Install missing dependencies now?',
        initial: true,
    });

    if (!install) {
        printMissingDependencies(projectRoot, audit);
        return;
    }

    await installMissingDependencies(projectRoot, audit);
}
