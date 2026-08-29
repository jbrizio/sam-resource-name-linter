# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-08-28

### Added
- `--help` / `-h`, `--config` / `-c`, and `--template` / `-t` CLI flags.
- HTTPS rules files (`https://` URLs) with a fetch timeout.
- Non-zero exit codes: `0` passed, `1` naming violations, `2` tool/usage/IO errors.
- Additional CloudFormation intrinsic tags so typical SAM templates parse (`!If`, `!Equals`, sequence `!Sub` / `!GetAtt`, and others).
- Packaged MIT `LICENSE` and a `files` field so npm publishes only the library.

### Fixed
- `bin` now points at `./src/cli.mjs` so `sam-resource-name-linter` runs after install.
- YAML parsing now extends js-yaml `DEFAULT_SCHEMA` instead of replacing it.
- Missing or non-string name properties report an error instead of throwing.
- JSON Schema matches the `{ "$schema", "rules" }` configuration shape.
- Invalid rules JSON is reported instead of crashing the process.

### Changed
- Runtime dependency `js-yaml` is constrained to the patched 4.x line (`^4.3.2`).
- Tests use Node's built-in test runner; Jest and Babel were removed.
- Documentation clarifies that **property values** (not logical IDs) are validated. Example resource types include `AWS::S3::Bucket` (there is no `AWS::Serverless::Bucket`).

## [1.0.0] - 2025-04-02
### Added
- Initial release of `sam-resource-name-linter`.
- Support for validating AWS SAM resource names against configurable rules.
- Ability to specify naming rules for different AWS resource types, including:
  - `AWS::Serverless::Function`
  - `AWS::S3::Bucket`
  - `AWS::Serverless::Api`
- Support for `maxLength`, `pattern`, and `excludedWords` rules.
- Customizable property name validation within `resource.Properties`.

### Fixed
- N/A

### Changed
- N/A

### Removed
- N/A
