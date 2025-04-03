#!/usr/bin/env node
import { performValidation } from './validators.mjs';
import { parseSamTemplate } from './parsers.mjs';
import { readFileSync, existsSync } from 'fs';
import { readRules } from './readers.mjs';

/**
 * @description Reads and parses a SAM template file.
 * @returns {object} The parsed SAM template as a JavaScript object.
 */
function readSamTemplate() {
    const templateFile = ['template.yaml', 'template.yml'].find((file) => existsSync(file));

    if (!templateFile) {
        console.warn('No SAM template file found.');
        return;
    }

    try {
        const data = readFileSync(templateFile, 'utf8');
        return parseSamTemplate(data);
    } catch (error) {
        console.error(`Error reading or parsing SAM template file "${templateFile}": ${error.message}`);
        return;
    }
}

/**
 * @description
 * The main function of the SAM resource name linter.
 * Reads resource naming rules, parses a SAM template, and validates the template against the rules.
 * Outputs validation results to the console.
 */
function main() {
    const rules = readRules();
    const template = readSamTemplate();
    const errors = performValidation(rules, template);

    if (errors.length === 0) {
        console.log('✅ Resource naming validation passed successfully.');
        return;
    }

    console.error('❌ Validation failed with the following errors:');
    errors.forEach((error) => console.error(`- ${error}`));
}

main();