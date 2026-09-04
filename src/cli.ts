#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { addFormBuilder } from './commands/add';
import { colors } from './utils/colors';

function getVersion(): string {
    try {
        const pkgPath = path.resolve(__dirname, '../package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            return pkg.version || '1.0.0';
        }
    } catch {
        // fallback
    }
    return '1.0.0';
}

const version = getVersion();
const program = new Command();

program
    .name('dynamic-form-builder-kit')
    .description('Drag-and-drop form builder for shadcn/ui applications')
    .version(version);

program
    .command('add', { isDefault: true })
    .description('Copy dynamic form builder components into your project')
    .option('-f, --force', 'Overwrite existing files')
    .option('-p, --path <path>', 'Custom destination path relative to project root')
    .option('-c, --cwd <cwd>', 'Working directory for the project (defaults to current dir)')
    .option('-y, --yes', 'Install missing dependencies without prompting')
    .option('--skip-deps', 'Skip dependency checks and installation')
    .action(async (opts: { force?: boolean; path?: string; cwd?: string; yes?: boolean; skipDeps?: boolean }) => {
        try {
            console.log(`\n${colors.bold(colors.cyan('◆ Dynamic Form Builder Kit'))} ${colors.dim(`v${version}`)}`);
            await addFormBuilder({
                force: opts.force,
                path: opts.path,
                cwd: opts.cwd,
                yes: opts.yes,
                skipDeps: opts.skipDeps,
            });
        } catch (error) {
            console.error(`\n${colors.red('✖ Error:')} ${error instanceof Error ? error.message : error}\n`);
            process.exit(1);
        }
    });

program.parse(process.argv);
