import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { performValidation } from '../src/validators.mjs';

const mockRules = {
    rules: {
        'AWS::Serverless::Function': {
            maxLength: 50,
            pattern: '^[a-z][a-z0-9-]*$',
            excludedWords: ['test', 'dev'],
        },
    },
};

describe('performValidation', () => {
    it('fails when the function name exceeds maxLength', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'this-name-is-too-long-and-exceeds-the-maximum-length' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        assert.ok(errors.includes('Resource "MyFunction" exceeds max length of 50 characters.'));
    });

    it('fails when the function name contains an excluded word', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'my-test-function' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        assert.ok(errors.includes('Resource "MyFunction" contains an excluded word.'));
    });

    it('treats excludedWords as substring matches', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'contest' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        assert.ok(errors.includes('Resource "MyFunction" contains an excluded word.'));
    });

    it('returns no errors when no resource types match', () => {
        const mockTemplate = {
            Resources: {
                MyResource: {
                    Type: 'AWS::Other::Resource',
                    Properties: { Name: 'my-resource' },
                },
            },
        };
        assert.deepEqual(performValidation(mockRules, mockTemplate), []);
    });

    it('returns no errors for an empty Resources map', () => {
        assert.deepEqual(performValidation(mockRules, { Resources: {} }), []);
    });

    it('fails when the function name does not match the pattern', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'InvalidFunction' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        assert.ok(errors.includes('Resource "MyFunction" does not match pattern "^[a-z][a-z0-9-]*$".'));
    });

    it('passes for a valid function name', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'my-valid-function' },
                },
            },
        };
        assert.deepEqual(performValidation(mockRules, mockTemplate), []);
    });

    it('reports a missing string property instead of throwing', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: {},
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        assert.deepEqual(errors, ['Resource "MyFunction" is missing string property "Name".']);
    });

    it('reports a non-string intrinsic as a missing string property', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { FunctionName: ['${Prefix}-fn', { Prefix: 'app' }] },
                },
            },
        };
        const rules = {
            rules: {
                'AWS::Serverless::Function': {
                    pattern: '^[a-z][a-z0-9-]*$',
                    propertyName: 'FunctionName',
                },
            },
        };
        const errors = performValidation(rules, mockTemplate);
        assert.deepEqual(errors, ['Resource "MyFunction" is missing string property "FunctionName".']);
    });

    it('returns a clear error when rules.rules is missing', () => {
        assert.deepEqual(performValidation({}, { Resources: {} }), ['Rules file is missing a "rules" object.']);
        assert.deepEqual(performValidation(null, { Resources: {} }), ['Rules file is missing a "rules" object.']);
    });

    it('returns a clear error when Resources is missing', () => {
        assert.deepEqual(performValidation(mockRules, {}), ['SAM template is missing a "Resources" section.']);
    });
});
