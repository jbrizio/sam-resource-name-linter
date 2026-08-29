import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseSamTemplate, parseRules, readRules, performValidation } from '../src/index.mjs';

describe('package exports', () => {
    it('re-exports the library API without running the CLI', () => {
        assert.equal(typeof parseSamTemplate, 'function');
        assert.equal(typeof parseRules, 'function');
        assert.equal(typeof readRules, 'function');
        assert.equal(typeof performValidation, 'function');
    });
});
