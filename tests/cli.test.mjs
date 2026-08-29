import { spawn } from 'node:child_process';
import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseArgs, getUsage, DEFAULT_RULES_PATH } from '../src/cli.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const cliPath = join(root, 'src/cli.mjs');
const fixtures = join(root, 'tests/fixtures');

function runCli(args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [cliPath, ...args], {
            cwd,
            env: { ...process.env },
        });
        let stdout = '';
        let stderr = '';
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });
        child.on('error', reject);
        child.on('close', (code) => resolve({ code, stdout, stderr }));
    });
}

describe('parseArgs', () => {
    it('uses default rules path when no arguments are given', () => {
        assert.deepEqual(parseArgs([]), {
            help: false,
            config: DEFAULT_RULES_PATH,
            template: null,
        });
    });

    it('treats a positional argument as the rules path', () => {
        assert.equal(parseArgs(['.custom-rules.json']).config, '.custom-rules.json');
    });

    it('reads --config and --template flags', () => {
        const args = parseArgs(['--config', 'rules.json', '--template', 'app.yaml']);
        assert.equal(args.config, 'rules.json');
        assert.equal(args.template, 'app.yaml');
    });

    it('reads short flags -c, -t, and -h', () => {
        const args = parseArgs(['-c', 'https://example.com/rules.json', '-t', 'nested.yaml', '-h']);
        assert.equal(args.config, 'https://example.com/rules.json');
        assert.equal(args.template, 'nested.yaml');
        assert.equal(args.help, true);
    });

    it('throws on an unknown option', () => {
        assert.throws(() => parseArgs(['--quiet']), /Unknown option: --quiet/);
    });

    it('throws when --config is missing a value', () => {
        assert.throws(() => parseArgs(['--config']), /requires a value/);
    });

    it('throws on extra positional arguments', () => {
        assert.throws(() => parseArgs(['a.json', 'b.json']), /Unexpected extra arguments/);
    });
});

describe('CLI', () => {
    it('prints usage and exits 0 for --help', async () => {
        const result = await runCli(['--help'], root);
        assert.equal(result.code, 0);
        assert.equal(result.stdout.trim(), getUsage());
    });

    it('exits 0 when the valid fixture passes', async () => {
        const result = await runCli([], join(fixtures, 'valid'));
        assert.equal(result.code, 0);
        assert.match(result.stdout, /validation passed successfully/);
    });

    it('exits 1 when names violate the rules', async () => {
        const result = await runCli([], join(fixtures, 'invalid'));
        assert.equal(result.code, 1);
        assert.match(result.stderr, /does not match pattern/);
        assert.match(result.stderr, /MyFunction/);
    });

    it('exits 2 when the rules file is missing', async () => {
        const result = await runCli(['--template', join(fixtures, 'valid/template.yaml')], root);
        assert.equal(result.code, 2);
        assert.match(result.stderr, /does not exist/);
    });

    it('exits 2 when no template is found', async () => {
        const result = await runCli(['--config', join(fixtures, 'valid/.sam-resource-name-rules.json')], root);
        assert.equal(result.code, 2);
        assert.match(result.stderr, /No SAM template file found/);
    });

    it('exits 2 for an unknown flag and prints usage', async () => {
        const result = await runCli(['--nope'], root);
        assert.equal(result.code, 2);
        assert.match(result.stderr, /Unknown option/);
        assert.match(result.stderr, /Usage:/);
    });

    it('accepts --template for a non-default filename', async () => {
        const dir = join(fixtures, 'custom-template');
        const result = await runCli([
            '--config',
            join(dir, 'org-rules.json'),
            '--template',
            join(dir, 'app.yaml'),
        ], root);
        assert.equal(result.code, 0, result.stderr);
        assert.match(result.stdout, /validation passed successfully/);
    });

    it('accepts a positional rules path', async () => {
        const dir = join(fixtures, 'custom-template');
        const result = await runCli([
            join(dir, 'org-rules.json'),
            '--template',
            join(dir, 'app.yaml'),
        ], root);
        assert.equal(result.code, 0, result.stderr);
    });

    it('runs when invoked through a symlink like the npm bin', async () => {
        const tempDir = await mkdtemp(join(tmpdir(), 'sam-bin-'));
        const link = join(tempDir, 'sam-resource-name-linter');
        try {
            await symlink(cliPath, link);
            const result = await new Promise((resolve, reject) => {
                const child = spawn(process.execPath, [link], {
                    cwd: join(fixtures, 'valid'),
                    env: { ...process.env },
                });
                let stdout = '';
                let stderr = '';
                child.stdout.setEncoding('utf8');
                child.stderr.setEncoding('utf8');
                child.stdout.on('data', (chunk) => {
                    stdout += chunk;
                });
                child.stderr.on('data', (chunk) => {
                    stderr += chunk;
                });
                child.on('error', reject);
                child.on('close', (code) => resolve({ code, stdout, stderr }));
            });
            assert.equal(result.code, 0, result.stderr);
            assert.match(result.stdout, /validation passed successfully/);
        } finally {
            await rm(tempDir, { recursive: true, force: true });
        }
    });
});
