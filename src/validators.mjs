/**
 * @description Retrieves the value of a specified property from a resource's properties.
 * @param {object} resourceRules - The rules object for the resource type, which may include a custom property name.
 * @param {object} resource - The resource object from the SAM template, containing its properties.
 * @returns {string|undefined} - The value of the specified property, or undefined if the property does not exist.
 */
function getPropertyValue(resourceRules, resource) {
    const propertyName = resourceRules.propertyName || "Name";
    return resource.Properties?.[propertyName];
}

/**
 * @description Validates a SAM template against a set of resource naming rules.
 * @param {object} rules - An object containing the resource naming rules. Must be in the format defined by the `.sam-resource-name-rules.json` file.
 * @param {object} template - The parsed SAM template as a JavaScript object. Must be a valid SAM template object.
 * @returns {string[]} An array of error messages. Returns an empty array if the template is valid.
 */
export function performValidation(rules, template) {
    const errors = [];

    for (const [resourceType, resourceRules] of Object.entries(rules.rules)) {
        for (const [resourceName, resource] of Object.entries(template.Resources)) {
            if (resource.Type === resourceType) {
                const propertyValue = getPropertyValue(resourceRules, resource);
                if (resourceRules.maxLength && propertyValue.length > resourceRules.maxLength) {
                    errors.push(`Resource "${resourceName}" exceeds max length of ${resourceRules.maxLength} characters.`);
                }
                const pattern = new RegExp(resourceRules.pattern);
                if (resourceRules.pattern && !pattern.test(propertyValue)) {
                    errors.push(`Resource "${resourceName}" does not match pattern "${resourceRules.pattern}".`);
                }
                if (resourceRules.excludedWords && resourceRules.excludedWords.some((word) => propertyValue.toLowerCase().includes(word))) {
                    errors.push(`Resource "${resourceName}" contains an excluded word.`);
                }
            }
        }
    }
    return errors;
}