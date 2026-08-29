import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));

describe('rules JSON Schema', () => {
    it('describes a root object with $schema and rules', () => {
        const schema = JSON.parse(readFileSync(join(root, '.sam-resource-name-rules.schema.json'), 'utf8'));
        assert.deepEqual(schema.required, ['rules']);
        assert.equal(schema.properties.$schema.type, 'string');
        assert.equal(schema.properties.rules.type, 'object');
        assert.deepEqual(schema.properties.rules.additionalProperties.required, ['pattern', 'propertyName']);
    });

    it('accepts the valid fixture shape', () => {
        const fixture = JSON.parse(
            readFileSync(join(root, 'tests/fixtures/valid/.sam-resource-name-rules.json'), 'utf8'),
        );
        assert.ok(fixture.rules);
        for (const rule of Object.values(fixture.rules)) {
            assert.equal(typeof rule.pattern, 'string');
            assert.equal(typeof rule.propertyName, 'string');
        }
    });

    it('includes a valid JSON example in the README', () => {
        const readme = readFileSync(join(root, 'README.md'), 'utf8');
        const blocks = [...readme.matchAll(/```json\n([\s\S]*?)```/g)].map((match) => match[1]);
        let example;
        for (const block of blocks) {
            try {
                const parsed = JSON.parse(block);
                if (parsed.rules) {
                    example = parsed;
                    break;
                }
            } catch {
                // Ignore non-rules JSON examples such as package.json snippets.
            }
        }
        assert.ok(example, 'README should contain a parseable rules JSON example');
        assert.ok(example.rules['AWS::Serverless::Function']);
        assert.equal(example.rules['AWS::Serverless::Function'].propertyName, 'FunctionName');
        assert.equal(example.rules['AWS::S3::Bucket'].propertyName, 'BucketName');
        assert.ok(!('AWS::Serverless::Bucket' in example.rules));
    });
});
