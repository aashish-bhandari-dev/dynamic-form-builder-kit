import fs from 'fs-extra';
import path from 'path';
import { findProjectRoot } from '../utils/paths';

export type InitOptions = {
    cwd?: string;
};

export async function initFormBuilder(options: InitOptions = {}): Promise<void> {
    const projectRoot = findProjectRoot(options.cwd ?? process.cwd());
    const configPath = path.join(projectRoot, 'dfb.config.json');

    const defaults = {
        $schema: 'https://unpkg.com/dynamic-form-builder/dfb.schema.json',
        componentPath: 'components/form-builder',
        registry: 'default',
    };

    if (fs.existsSync(configPath)) {
        console.log('dfb.config.json already exists — skipping init.');
        return;
    }

    await fs.writeJson(configPath, defaults, { spaces: 2 });
    console.log('✔ Created dfb.config.json');
    console.log('\nRun: npx dynamic-form-builder add\n');
}
