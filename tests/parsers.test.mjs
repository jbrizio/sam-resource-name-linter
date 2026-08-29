import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseRules, parseSamTemplate } from '../src/parsers.mjs';

describe('parseRules', () => {
    it('parses a valid JSON string', () => {
        assert.deepEqual(parseRules('{"key":"value"}'), { key: 'value' });
    });

    it('parses an empty JSON object', () => {
        assert.deepEqual(parseRules('{}'), {});
    });

    it('throws on invalid JSON', () => {
        assert.throws(() => parseRules(''), SyntaxError);
    });
});

describe('parseSamTemplate', () => {
    it('parses a valid YAML SAM template', () => {
        const yamlString = `Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs18.x`;
        const result = parseSamTemplate(yamlString);
        assert.equal(result.Resources.MyFunction.Type, 'AWS::Serverless::Function');
    });

    it('returns undefined for an empty YAML string', () => {
        assert.equal(parseSamTemplate(''), undefined);
    });

    it('resolves scalar !Ref and static !Join', () => {
        const result = parseSamTemplate(`Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Join ['-', [my, valid, function]]
      Role: !Ref MyRole`);
        assert.equal(result.Resources.MyFunction.Properties.FunctionName, 'my-valid-function');
        assert.equal(result.Resources.MyFunction.Properties.Role, 'MyRole');
    });

    it('parses sequence !Sub and !GetAtt without throwing', () => {
        const result = parseSamTemplate(`Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !Sub
        - '\${Prefix}-fn'
        - Prefix: myapp
      Role: !GetAtt
        - MyRole
        - Arn`);
        assert.deepEqual(result.Resources.MyFunction.Properties.FunctionName[0], '${Prefix}-fn');
        assert.deepEqual(result.Resources.MyFunction.Properties.Role, ['MyRole', 'Arn']);
    });

    it('parses !If as a pass-through sequence', () => {
        const result = parseSamTemplate(`Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: !If [UseCustom, custom-name, default-name]`);
        assert.deepEqual(result.Resources.MyFunction.Properties.FunctionName, ['UseCustom', 'custom-name', 'default-name']);
    });
});
