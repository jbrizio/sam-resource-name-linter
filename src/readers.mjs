import { existsSync, readFileSync } from 'fs';
import { parseRules } from './parsers.mjs';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * @description Reads the resource naming rules from a local file or a remote URL.
 * @param {string} [configFilePath='.sam-resource-name-rules.json'] - Path or URL to the rules file.
 * @returns {Promise<object|null>} An object representing the parsed JSON rules, or null if an error occurs.
 */
export async function readRules(configFilePath = '.sam-resource-name-rules.json') {
    try {
        let rulesData;

        if (configFilePath.startsWith('https://')) {
            const response = await fetch(configFilePath, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            if (!response.ok) {
                console.error(`Failed to fetch rules from URL: ${configFilePath}`);
                return null;
            }
            rulesData = await response.text();
        } else {
            if (!existsSync(configFilePath)) {
                console.error(`File "${configFilePath}" with the resource naming rules does not exist.`);
                return null;
            }
            rulesData = readFileSync(configFilePath, 'utf8');
        }

        return parseRules(rulesData);
    } catch (error) {
        console.error(`Error reading or parsing rules from "${configFilePath}": ${error.message}`);
        return null;
    }
}
