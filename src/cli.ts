#!/usr/bin/env node

import { Command } from 'commander';
import { addFormBuilder } from './commands/add';
import { initFormBuilder } from './commands/init';

const program = new Command();

program
    .name('dynamic-form-builder')
    .description('Copy form builder UI components into your project (shadcn-style)')
    .version(require('../package.json').version);

program
    .command('init')
    .description('Create dfb.config.json in the current project')
    .action(async () => {
        try {
            await initFormBuilder();
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('add')
    .description('Copy form builder components to components/form-builder/')
    .option('-f, --force', 'Overwrite existing files')
    .option('-p, --path <path>', 'Custom destination path relative to project root')
    .action(async (opts: { force?: boolean; path?: string }) => {
        try {
            await addFormBuilder({ force: opts.force, path: opts.path });
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program.parse(process.argv);
