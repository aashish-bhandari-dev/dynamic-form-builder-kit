import prompts from 'prompts';
import type { DependencyAudit } from './dependencies';
import { installMissingDependencies, printMissingDependencies } from './install';

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
        console.log('\nNon-interactive terminal — skipping auto-install.');
        printMissingDependencies(projectRoot, audit);
        console.log('Re-run with --yes to install automatically.\n');
        return;
    }

    const lines: string[] = [];
    if (audit.missingNpm.length > 0) {
        lines.push(`npm: ${audit.missingNpm.join(', ')}`);
    }
    if (audit.missingShadcn.length > 0) {
        lines.push(`shadcn: ${audit.missingShadcn.join(', ')}`);
    }
    if (!audit.hasComponentsJson && audit.missingShadcn.length > 0) {
        lines.push('(will run shadcn init, then add missing components)');
    }

    console.log('\nThe following dependencies are missing:\n');
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
