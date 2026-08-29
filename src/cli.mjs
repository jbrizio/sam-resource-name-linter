#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync } from 'fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import { parseSamTemplate } from './parsers.mjs';
import { readRules } from './readers.mjs';
import { performValidation } from './validators.mjs';

export const DEFAULT_RULES_PATH = '.sam-resource-name-rules.json';
export const DEFAULT_TEMPLATE_FILES = ['template.yaml', 'template.yml'];

/**
 * @description Parses CLI arguments for the SAM resource name linter.
 * @param {string[]} argv - Argument list (typically `process.argv.slice(2)`).
 * @returns {{ help: boolean, config: string, template: string|null }} Parsed options.
 */
export function parseArgs(argv) {
    const result = {
        help: false,
        config: DEFAULT_RULES_PATH,
        template: null,
    };
    const positional = [];

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];

        if (arg === '-h' || arg === '--help') {
            result.help = true;
            continue;
        }

        if (arg === '--config' || arg === '-c') {
            const value = argv[i + 1];
            if (!value || value.startsWith('-')) {
                throw new Error(`Option ${arg} requires a value.`);
            }
            result.config = value;
            i += 1;
            continue;
        }

        if (arg === '--template' || arg === '-t') {
            const value = argv[i + 1];
            if (!value || value.startsWith('-')) {
                throw new Error(`Option ${arg} requires a value.`);
            }
            result.template = value;
            i += 1;
            continue;
        }

        if (arg.startsWith('-')) {
            throw new Error(`Unknown option: ${arg}`);
        }

        positional.push(arg);
    }

    if (positional.length > 1) {
        throw new Error('Unexpected extra arguments.');
    }

    if (positional[0]) {
        result.config = positional[0];
    }

    return result;
}

/**
 * @description Returns the CLI usage text.
 * @returns {string} Usage help.
 */
export function getUsage() {
    return `Usage:
  sam-resource-name-linter [rules-file]
  sam-resource-name-linter [options]

Validate AWS SAM resource property names against a rules file.

Options:
  -c, --config <path|url>   Rules file path or https URL
                            (default: ${DEFAULT_RULES_PATH})
  -t, --template <path>      SAM template path
                            (default: template.yaml or template.yml in the current directory)
  -h, --help                 Show this help message

Exit codes:
  0  Validation passed
  1  Naming convention violations
  2  Tool, usage, or I/O error`;
}

/**
 * @description Reads and parses a SAM template from a path or the default filenames.
 * @param {string|null} [templatePath] - Explicit template path from --template.
 * @returns {object|null} The parsed template, or null if it cannot be read.
 */
export function readSamTemplate(templatePath) {
    const templateFile = templatePath
        || DEFAULT_TEMPLATE_FILES.find((file) => existsSync(file));

    if (!templateFile) {
        console.error('No SAM template file found. Looked for template.yaml and template.yml, or pass --template <path>.');
        return null;
    }

    if (!existsSync(templateFile)) {
        console.error(`SAM template file "${templateFile}" does not exist.`);
        return null;
    }

    try {
        const data = readFileSync(templateFile, 'utf8');
        const template = parseSamTemplate(data);
        if (!template) {
            console.error(`SAM template file "${templateFile}" is empty or invalid.`);
            return null;
        }
        return template;
    } catch (error) {
        console.error(`Error reading or parsing SAM template file "${templateFile}": ${error.message}`);
        return null;
    }
}

/**
 * @description Runs the linter and returns a process exit code.
 * @param {string[]} [argv] - Argument list (typically `process.argv.slice(2)`).
 * @returns {Promise<number>} Exit code (0, 1, or 2).
 */
export async function main(argv = process.argv.slice(2)) {
    let args;

    try {
        args = parseArgs(argv);
    } catch (error) {
        console.error(error.message);
        console.error(getUsage());
        return 2;
    }

    if (args.help) {
        console.log(getUsage());
        return 0;
    }

    try {
        const rules = await readRules(args.config);
        if (!rules) {
            return 2;
        }
        if (!rules.rules || typeof rules.rules !== 'object') {
            console.error('Rules file is missing a "rules" object.');
            return 2;
        }

        const template = readSamTemplate(args.template);
        if (!template) {
            return 2;
        }
        if (!template.Resources || typeof template.Resources !== 'object') {
            console.error('SAM template is missing a "Resources" section.');
            return 2;
        }

        const errors = performValidation(rules, template);

        if (errors.length === 0) {
            console.log('✅ Resource naming validation passed successfully.');
            return 0;
        }

        console.error('❌ Validation failed with the following errors:');
        errors.forEach((error) => console.error(`- ${error}`));
        return 1;
    } catch (error) {
        console.error(error.message);
        return 2;
    }
}

function isExecutedAsCli() {
    const entry = process.argv[1];
    if (!entry) {
        return false;
    }

    try {
        return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(entry));
    } catch {
        return false;
    }
}

if (isExecutedAsCli()) {
    main().then((code) => process.exit(code));
}
