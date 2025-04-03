import { readFileSync, existsSync } from 'fs';
import { parseRules } from './parsers.mjs';

/**
 * @description Reads the resource naming rules from a JSON file.
 * @returns {object} An object representing the parsed JSON rules. Returns null if an error occurs during file reading or parsing.
 */
export function readRules() {
    const configFilePath = '.sam-resource-name-rules.json';
    if (!existsSync(configFilePath)) {
        console.error(`File "${configFilePath}" with the resource naming rules does not exist.`);
        return;
    }
    const data = readFileSync(configFilePath, 'utf8');
    return parseRules(data);
}