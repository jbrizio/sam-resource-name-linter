import { parseRules } from '../src/parsers.mjs';
import { readRules } from '../src/readers.mjs';
import { readFileSync, existsSync } from 'fs';

jest.mock('fs', () => ({
    __esModule: true,
    readFileSync: jest.fn(),
    existsSync: jest.fn(),
}));

jest.mock('../src/parsers.mjs', () => ({
    __esModule: true,
    parseRules: jest.fn(),
}));

describe('readRules', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        readFileSync.mockRestore();
        existsSync.mockRestore();
    });

    it('should return parsed rules if file exists', () => {
        const mockRulesJson = `{"rules": {"AWS::Serverless::Function": {"maxLength": 50}}}`;
        readFileSync.mockReturnValue(mockRulesJson);
        existsSync.mockReturnValue(true);
        const rules = readRules();
        expect(rules).toEqual(parseRules(mockRulesJson));
    });

    it('should handle empty file', () => {
        readFileSync.mockReturnValue('');
        existsSync.mockReturnValue(true);
        const rules = readRules();
        expect(rules).toBeUndefined();
    });

    it('should print an error if file does not exist', () => {
        existsSync.mockReturnValue(false);
        readRules();
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('File ".sam-resource-name-rules.json" with the resource naming rules does not exist.'));
    });
});