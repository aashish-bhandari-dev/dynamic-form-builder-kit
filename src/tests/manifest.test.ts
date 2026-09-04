import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import {
    FORM_BUILDER_COMPONENT_FILES,
    SHADCN_COMPONENTS,
    NPM_DEPENDENCIES,
    REGISTRY_COMPONENTS_DIR,
} from '../registry-manifest';
import {
    getInstallCommand,
    getExecuteCommand,
    type PackageManager,
} from '../utils/package-manager';

describe('Registry Manifest & Files Integrity', () => {
    it('all declared component files exist in registry', () => {
        const rootDir = path.resolve(__dirname, '../../');
        const regDir = path.join(rootDir, 'registry', REGISTRY_COMPONENTS_DIR);

        assert.ok(fs.existsSync(regDir), `Registry directory exists: ${regDir}`);

        for (const file of FORM_BUILDER_COMPONENT_FILES) {
            const filePath = path.join(regDir, file);
            assert.ok(fs.existsSync(filePath), `Registry file must exist: ${file}`);
        }
    });

    it('shadcn/ui dependencies list is non-empty', () => {
        assert.ok(SHADCN_COMPONENTS.length > 0);
        assert.ok(SHADCN_COMPONENTS.includes('button'));
        assert.ok(SHADCN_COMPONENTS.includes('input'));
        assert.ok(SHADCN_COMPONENTS.includes('tabs'));
    });

    it('npm dependencies includes lucide-react', () => {
        assert.ok(NPM_DEPENDENCIES.includes('lucide-react'));
    });
});

describe('Package Manager Utilities', () => {
    it('generates correct install commands', () => {
        assert.deepEqual(getInstallCommand('npm', ['lucide-react']), {
            command: 'npm',
            args: ['install', 'lucide-react'],
        });
        assert.deepEqual(getInstallCommand('pnpm', ['lucide-react']), {
            command: 'pnpm',
            args: ['add', 'lucide-react'],
        });
        assert.deepEqual(getInstallCommand('yarn', ['lucide-react']), {
            command: 'yarn',
            args: ['add', 'lucide-react'],
        });
        assert.deepEqual(getInstallCommand('bun', ['lucide-react']), {
            command: 'bun',
            args: ['add', 'lucide-react'],
        });
    });

    it('generates correct execute commands', () => {
        assert.deepEqual(getExecuteCommand('npm', ['shadcn@latest', 'add']), {
            command: 'npx',
            args: ['shadcn@latest', 'add'],
        });
        assert.deepEqual(getExecuteCommand('pnpm', ['shadcn@latest', 'add']), {
            command: 'pnpm',
            args: ['dlx', 'shadcn@latest', 'add'],
        });
        assert.deepEqual(getExecuteCommand('yarn', ['shadcn@latest', 'add']), {
            command: 'yarn',
            args: ['dlx', 'shadcn@latest', 'add'],
        });
        assert.deepEqual(getExecuteCommand('bun', ['shadcn@latest', 'add']), {
            command: 'bunx',
            args: ['--bun', 'shadcn@latest', 'add'],
        });
    });
});
