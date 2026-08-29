import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { readRules } from '../src/readers.mjs';

function silenceConsoleError() {
    const original = console.error;
    const messages = [];
    console.error = (...args) => {
        messages.push(args.map(String).join(' '));
    };
    return {
        messages,
        restore() {
            console.error = original;
        },
    };
}

describe('readRules', () => {
    const originalFetch = globalThis.fetch;
    let tempDir;

    afterEach(async () => {
        globalThis.fetch = originalFetch;
        if (tempDir) {
            await rm(tempDir, { recursive: true, force: true });
            tempDir = undefined;
        }
    });

    it('returns parsed rules from a local file', async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'sam-rules-'));
        const path = join(tempDir, 'rules.json');
        const json = '{"rules":{"AWS::Serverless::Function":{"pattern":"^a$","propertyName":"FunctionName"}}}';
        await writeFile(path, json);

        const rules = await readRules(path);
        assert.deepEqual(rules, JSON.parse(json));
    });

    it('returns null and prints an error if the file does not exist', async () => {
        const spy = silenceConsoleError();
        try {
            const rules = await readRules('missing-rules.json');
            assert.equal(rules, null);
            assert.match(spy.messages.join('\n'), /missing-rules.json/);
        } finally {
            spy.restore();
        }
    });

    it('returns null for invalid JSON', async () => {
        tempDir = await mkdtemp(join(tmpdir(), 'sam-rules-'));
        const path = join(tempDir, 'broken.json');
        await writeFile(path, '{not json');
        const spy = silenceConsoleError();
        try {
            const rules = await readRules(path);
            assert.equal(rules, null);
            assert.match(spy.messages.join('\n'), /Error reading or parsing rules/);
        } finally {
            spy.restore();
        }
    });

    it('fetches and parses rules from an https URL', async () => {
        const payload = '{"rules":{}}';
        globalThis.fetch = async (url, options) => {
            assert.equal(url, 'https://example.com/rules.json');
            assert.ok(options.signal);
            return {
                ok: true,
                text: async () => payload,
            };
        };

        const rules = await readRules('https://example.com/rules.json');
        assert.deepEqual(rules, { rules: {} });
    });

    it('returns null when the https response is not ok', async () => {
        globalThis.fetch = async () => ({ ok: false, text: async () => '' });
        const spy = silenceConsoleError();
        try {
            const rules = await readRules('https://example.com/missing.json');
            assert.equal(rules, null);
            assert.match(spy.messages.join('\n'), /Failed to fetch rules/);
        } finally {
            spy.restore();
        }
    });

    it('returns null when fetch throws', async () => {
        globalThis.fetch = async () => {
            throw new Error('network down');
        };
        const spy = silenceConsoleError();
        try {
            const rules = await readRules('https://example.com/rules.json');
            assert.equal(rules, null);
            assert.match(spy.messages.join('\n'), /network down/);
        } finally {
            spy.restore();
        }
    });
});
