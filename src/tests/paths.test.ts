import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import os from 'os';
import {
    findProjectRoot,
    getAliasPrefix,
    getComponentsAlias,
    getUiAlias,
    getLibAlias,
    getTypesAlias,
    getFormBuilderTargetDir,
    resolveAliasPath,
} from '../utils/paths';

describe('Path & Alias Resolution', () => {
    it('findProjectRoot locates package.json in current or parent dir', () => {
        const root = findProjectRoot(__dirname);
        assert.ok(fs.existsSync(path.join(root, 'package.json')));
    });

    it('defaults aliases correctly when no components.json exists', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dfb-test-'));
        try {
            assert.equal(getAliasPrefix(tempDir), '@/');
            assert.equal(getComponentsAlias(tempDir), '@/components');
            assert.equal(getUiAlias(tempDir), '@/components/ui');
            assert.equal(getLibAlias(tempDir), '@/lib');
            assert.equal(getTypesAlias(tempDir), '@/types');
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('reads custom aliases from components.json', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dfb-test-'));
        try {
            const config = {
                aliases: {
                    components: '~/custom-components',
                    ui: '~/custom-components/ui',
                    lib: '~/custom-lib',
                },
            };
            fs.writeFileSync(path.join(tempDir, 'components.json'), JSON.stringify(config));

            assert.equal(getAliasPrefix(tempDir), '~/');
            assert.equal(getComponentsAlias(tempDir), '~/custom-components');
            assert.equal(getUiAlias(tempDir), '~/custom-components/ui');
            assert.equal(getLibAlias(tempDir), '~/custom-lib');
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('resolves alias paths with src directory presence', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dfb-test-'));
        try {
            fs.mkdirSync(path.join(tempDir, 'src'));
            const resolved = resolveAliasPath(tempDir, '@/components');
            assert.equal(resolved, path.join(tempDir, 'src', 'components'));
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('computes correct target form-builder directory', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dfb-test-'));
        try {
            const target = getFormBuilderTargetDir(tempDir);
            assert.equal(target, path.join(tempDir, 'components', 'form-builder'));
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
