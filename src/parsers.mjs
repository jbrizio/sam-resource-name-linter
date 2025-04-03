import { customSchema } from '../schemas/index.mjs';
import { load } from 'js-yaml';

/**
 * @description Parses a JSON string into a JavaScript object.
 * @param {string} jsonString - A JSON string to parse.
 * @returns {object} The parsed JavaScript object.
 */
export function parseRules(jsonString) {
    return JSON.parse(jsonString);
}

/**
 * @description Parses a YAML string into a JavaScript object.
 * @param {string} yamlString - A YAML string to parse.
 * @returns {object} The parsed JavaScript object.
 */
export function parseSamTemplate(yamlString) {
    return load(yamlString, { schema: customSchema });
}