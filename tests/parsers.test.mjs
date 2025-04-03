import { parseRules, parseSamTemplate } from '../src/parsers.mjs';

describe('parseRules', () => {
  it('should parse a valid JSON string', () => {
    const jsonString = `{"key": "value"}`;
    const result = parseRules(jsonString);
    expect(result).toEqual({ key: 'value' });
  });

  it('should handle an empty JSON string', () => {
    const emptyJsonString = `{}`;
    const result = parseRules(emptyJsonString);
    expect(result).toEqual({});
  });
});

describe('parseSamTemplate', () => {
  it('should parse a valid YAML string', () => {
    const yamlString = `Resources:
      MyFunction:
        Type: AWS::Serverless::Function
        Properties:
          Handler: index.handler
          Runtime: nodejs18.x`;
    const result = parseSamTemplate(yamlString);
    expect(result.Resources).toBeDefined();
    expect(result.Resources.MyFunction).toBeDefined();
    expect(result.Resources.MyFunction.Type).toBe('AWS::Serverless::Function');
  });

  it('should handle an empty YAML string', () => {
    const yamlString = ``;
    const result = parseSamTemplate(yamlString);
    expect(result).toBeUndefined();
  });
});