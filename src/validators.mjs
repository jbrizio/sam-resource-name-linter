/**
 * @description Retrieves the value of a specified property from a resource's properties.
 * @param {object} resourceRules - The rules object for the resource type, which may include a custom property name.
 * @param {object} resource - The resource object from the SAM template, containing its properties.
 * @returns {{ propertyName: string, propertyValue: unknown }} The property name and its value.
 */
function getProperty(resourceRules, resource) {
    const propertyName = resourceRules.propertyName || 'Name';
    return {
        propertyName,
        propertyValue: resource.Properties?.[propertyName],
    };
}

/**
 * @description Validates a SAM template against a set of resource naming rules.
 * @param {object} rules - An object containing the resource naming rules. Must be in the format defined by the `.sam-resource-name-rules.json` file.
 * @param {object} template - The parsed SAM template as a JavaScript object. Must be a valid SAM template object.
 * @returns {string[]} An array of error messages. Returns an empty array if the template is valid.
 */
export function performValidation(rules, template) {
    if (!rules?.rules || typeof rules.rules !== 'object') {
        return ['Rules file is missing a "rules" object.'];
    }
    if (!template?.Resources || typeof template.Resources !== 'object') {
        return ['SAM template is missing a "Resources" section.'];
    }

    const errors = [];

    for (const [resourceType, resourceRules] of Object.entries(rules.rules)) {
        for (const [resourceName, resource] of Object.entries(template.Resources)) {
            if (resource?.Type !== resourceType) {
                continue;
            }

            const { propertyName, propertyValue } = getProperty(resourceRules, resource);
            if (typeof propertyValue !== 'string') {
                errors.push(`Resource "${resourceName}" is missing string property "${propertyName}".`);
                continue;
            }

            if (resourceRules.maxLength && propertyValue.length > resourceRules.maxLength) {
                errors.push(`Resource "${resourceName}" exceeds max length of ${resourceRules.maxLength} characters.`);
            }
            if (resourceRules.pattern) {
                const pattern = new RegExp(resourceRules.pattern);
                if (!pattern.test(propertyValue)) {
                    errors.push(`Resource "${resourceName}" does not match pattern "${resourceRules.pattern}".`);
                }
            }
            if (resourceRules.excludedWords && resourceRules.excludedWords.some((word) => propertyValue.toLowerCase().includes(word))) {
                errors.push(`Resource "${resourceName}" contains an excluded word.`);
            }
        }
    }
    return errors;
}
