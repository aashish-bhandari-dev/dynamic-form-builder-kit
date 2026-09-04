import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { addFormBuilder } from '../commands/add';
import {
    FORM_BUILDER_COMPONENT_FILES,
    FORM_BUILDER_TYPES_FILE,
    FORM_BUILDER_UTILS_FILE,
} from '../registry-manifest';

describe('addFormBuilder command execution', () => {
    it('installs component files, types, and utils, replacing aliases', async () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dfb-add-test-'));
        try {
            // Mock a consumer project with package.json and components.json
            fs.writeFileSync(
                path.join(tempDir, 'package.json'),
                JSON.stringify({ name: 'test-consumer-app', dependencies: { 'lucide-react': '^1.0.0' } }),
            );
            fs.writeFileSync(
                path.join(tempDir, 'components.json'),
                JSON.stringify({
                    aliases: {
                        components: '@/components',
                        ui: '@/components/ui',
                        lib: '@/lib',
                    },
                }),
            );

            // Execute add command
            await addFormBuilder({
                cwd: tempDir,
                skipDeps: true,
                yes: true,
            });

            const targetDir = path.join(tempDir, 'components', 'form-builder');
            assert.ok(fs.existsSync(targetDir), 'target directory was created');

            // Verify component files were copied
            for (const file of FORM_BUILDER_COMPONENT_FILES) {
                const filePath = path.join(targetDir, file);
                assert.ok(fs.existsSync(filePath), `file was copied: ${file}`);
            }

            // Verify types and utils were copied
            const typesPath = path.join(tempDir, 'types', FORM_BUILDER_TYPES_FILE);
            const utilsPath = path.join(tempDir, 'lib', FORM_BUILDER_UTILS_FILE);
            assert.ok(fs.existsSync(typesPath), 'types file was copied');
            assert.ok(fs.existsSync(utilsPath), 'utils file was copied');

            // Verify alias replacement occurred
            const builderContent = fs.readFileSync(path.join(targetDir, 'FormBuilder.tsx'), 'utf8');
            assert.ok(builderContent.includes('@/components/ui/button'));
            assert.ok(builderContent.includes('@/types/form-builder.types'));

            // Verify second run without force fails
            await assert.rejects(
                async () => {
                    await addFormBuilder({
                        cwd: tempDir,
                        skipDeps: true,
                    });
                },
                {
                    message: /Form builder already installed/,
                },
            );

            // Verify run with force succeeds
            await addFormBuilder({
                cwd: tempDir,
                skipDeps: true,
                force: true,
            });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
