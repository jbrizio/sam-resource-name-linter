# SAM Resource Name Linter

CLI that checks **resource property values** in an AWS SAM template (for example `FunctionName` or `BucketName`) against rules you define. It does not validate CloudFormation logical IDs (the keys under `Resources`).

## Installation

Install as a development dependency in your SAM project:

```bash
npm install --save-dev sam-resource-name-linter
```

You can also run it without adding a dependency:

```bash
npx sam-resource-name-linter
```

## Quick start

1. Add `.sam-resource-name-rules.json` at the root of your SAM project (next to `template.yaml` or `template.yml`).
2. Add an npm script:

```json
{
  "scripts": {
    "lint:resources": "sam-resource-name-linter"
  }
}
```

3. Run `npm run lint:resources`.

The linter looks for `template.yaml`, then `template.yml`, in the current working directory. It reads `.sam-resource-name-rules.json` unless you pass another rules file.

## Configuration

Example `.sam-resource-name-rules.json`:

```json
{
  "$schema": "node_modules/sam-resource-name-linter/.sam-resource-name-rules.schema.json",
  "rules": {
    "AWS::Serverless::Function": {
      "maxLength": 64,
      "pattern": "^[a-z][a-z0-9-]*$",
      "excludedWords": ["test", "dev"],
      "propertyName": "FunctionName"
    },
    "AWS::S3::Bucket": {
      "maxLength": 63,
      "pattern": "^[a-z][a-z0-9-]*$",
      "propertyName": "BucketName"
    },
    "AWS::Serverless::Api": {
      "maxLength": 128,
      "pattern": "^[a-z][a-z0-9-]*$",
      "propertyName": "Name"
    }
  }
}
```

| Field | Required | Description |
| --- | --- | --- |
| `rules` | yes | Map of CloudFormation/SAM resource types to rule objects. |
| `propertyName` | yes | Property under `Resources.<LogicalId>.Properties` to check. |
| `pattern` | yes | Regular expression the property value must match. |
| `maxLength` | no | Maximum length of the property value. |
| `excludedWords` | no | Substrings that must not appear in the value. Matching is case-insensitive and **substring-based** (`"test"` also matches `contest`). Prefer lowercase words. |
| `$schema` | no | Points at the packaged JSON Schema so editors can validate the file. |

Only resource types listed under `rules` are checked. Other types are ignored.

Names that are CloudFormation intrinsics rather than a literal string (for example a sequence `!Sub`) are reported as a missing string property. Static `!Join` values that resolve to a string are validated as that string.

## CLI

```text
sam-resource-name-linter [rules-file]
sam-resource-name-linter [options]
```

| Option | Description |
| --- | --- |
| `[rules-file]` | Positional path or `https://` URL for the rules file. |
| `-c`, `--config <path\|url>` | Same as the positional rules file. |
| `-t`, `--template <path>` | SAM template path (useful when the file is not `template.yaml` / `template.yml` in the current directory). |
| `-h`, `--help` | Print usage. |

### Examples

```bash
sam-resource-name-linter
sam-resource-name-linter .my-custom-rules.json
sam-resource-name-linter --config .my-custom-rules.json
sam-resource-name-linter --template sam/app-template.yaml
sam-resource-name-linter --config https://example.com/org-sam-resource-name-rules.json
```

Remote rules are fetched over HTTPS only (10 second timeout).

## Output and exit codes

Passing run:

```text
✅ Resource naming validation passed successfully.
```

Failing run:

```text
❌ Validation failed with the following errors:
- Resource "MyFunction" does not match pattern "^[a-z][a-z0-9-]*$".
- Resource "MyFunction" contains an excluded word.
```

| Code | Meaning |
| --- | --- |
| `0` | Validation passed (or `--help`). |
| `1` | One or more naming violations. |
| `2` | Usage error, missing files, or parse/IO failure. |

Use the exit code in CI so a failed naming check fails the job.

### GitHub Actions

```yaml
name: Lint SAM resource names
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx sam-resource-name-linter
```

## Programmatic use

```js
import { performValidation, parseSamTemplate, readRules } from 'sam-resource-name-linter';

const rules = await readRules('.sam-resource-name-rules.json');
const template = parseSamTemplate(yamlString);
const errors = performValidation(rules, template);
```

## Contributing

Contributions are welcome. Open an issue or submit a pull request.

## License

MIT
