# SAM Resource Name Linter

This package helps enforce naming conventions for AWS SAM resources. It reads a SAM template and validates resource names against a set of configurable rules.

## Why This Tool?
Maintaining consistent naming conventions across multiple AWS SAM projects is crucial for readability, maintainability, and team collaboration. This tool helps enforce a single standard, preventing inconsistencies and improving overall code quality. The benefit is amplified by its minimal external dependencies, ensuring ease of integration and reducing potential conflicts.

## Installation

```bash
npm install sam-resource-name-linter
```

## Usage

1. **Create the configuration file:** After installing the package in your repository with the previous command, you should create a new file called named `.sam-resource-name-rules.json` in the root directory of your SAM project.

2. **Configure the linter:** Before running the linter, personalize your configuration file (`.sam-resource-name-rules.json`) by defining the resource naming rules that suit your project's needs.

3. **Run the linter:** Execute the linter using the following command:

   ```bash
   sam-resource-name-linter
   ```

   Integrate the linter into your workflow by adding it to your project's npm scripts. This will automatically enforce your defined resource naming standards. The linter defaults to `.sam-resource-name-rules.json`

4. **Review the results:** The linter will output a message indicating whether the validation passed or failed. If it failed, it will list the specific errors encountered.

## Configuration File Format

The configuration file (`.sam-resource-name-rules.json`) is a JSON file with the following structure:

```json
{
  "$schema": "node_modules/sam-resource-name-linter/.sam-resource-name-rules.schema.json",
  "rules": {
    "AWS::Serverless::Function": {
      "maxLength": 63,
      "pattern": "^[a-z][a-z0-9-]*$",
      "excludedWords": ["test", "dev"],
      "propertyName": "FunctionName"
    },
    "AWS::Serverless::Api": {
      "maxLength": 63,
      "pattern": "^[a-z][a-z0-9-]*$",
      "propertyName": "Name"
    }
    // Add rules for other resource types as needed
  }
}
```

* `"rules"`: An object containing rules for different resource types.
* `<resource-type>`: The AWS resource type (e.g., `"AWS::Serverless::Function"`).
* `"maxLength"`: The maximum allowed length of the resource name (optional).
* `"pattern"`: A regular expression pattern that the resource name must match (required).
* `"excludedWords"`: An array of words that are not allowed in the resource name (optional).
* `"propertyName"`: Name of the resource property to be validated (required).

### Importance of `"$schema"`

Including the `"$schema"` property in your `.sam-resource-name-rules.json` file is highly recommended. This property points to a JSON Schema definition that describes the structure and data types expected in your configuration file. Using a JSON Schema offers several key benefits:

* **Validation:** It allows for automated validation of your configuration file, ensuring it conforms to the expected format.  This helps prevent errors and inconsistencies in your rules.
* **IDE Support:** Many IDEs and code editors leverage JSON Schema to provide features like autocompletion, linting, and error highlighting, making it easier to write and maintain your configuration files.
* **Maintainability:** The schema acts as a central source of truth for your configuration file's structure, improving maintainability and reducing the risk of errors as your rules evolve.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT