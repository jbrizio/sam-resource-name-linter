import { performValidation } from '../src/validators.mjs';

describe('performValidation', () => {
    const mockRules = {
        rules: {
            'AWS::Serverless::Function': {
                maxLength: 50,
                pattern: '^[a-z][a-z0-9-]*$',
                excludedWords: ['test', 'dev'],
            },
        },
    };

    it('should fail validation if function name exceeds maxLength', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'this-name-is-too-long-and-exceeds-the-maximum-length' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toContain('Resource "MyFunction" exceeds max length of 50 characters.');
    });

    it('should fail validation if function name contains excluded word', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'my-test-function' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toContain('Resource "MyFunction" contains an excluded word.');
    });

    it('should handle template with no matching resource type', () => {
        const mockTemplate = {
            Resources: {
                MyResource: {
                    Type: 'AWS::Other::Resource',
                    Properties: { Name: 'my-resource' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toEqual([]);
    });

    it('should handle empty template', () => {
        const mockTemplate = { Resources: {} };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toEqual([]);
    });

    it('should fail validation if function name does not match pattern', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'InvalidFunction' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toContain('Resource "MyFunction" does not match pattern "^[a-z][a-z0-9-]*$".');
    });

    it('should pass validation for a valid function name', () => {
        const mockTemplate = {
            Resources: {
                MyFunction: {
                    Type: 'AWS::Serverless::Function',
                    Properties: { Name: 'my-valid-function' },
                },
            },
        };
        const errors = performValidation(mockRules, mockTemplate);
        expect(errors).toEqual([]);
    });
});