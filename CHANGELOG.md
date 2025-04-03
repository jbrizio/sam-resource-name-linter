# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-04-02
### Added
- Initial release of `sam-resource-name-linter`.
- Support for validating AWS SAM resource names against configurable rules.
- Ability to specify naming rules for different AWS resource types, including:
  - `AWS::Serverless::Function`
  - `AWS::Serverless::Bucket`
  - `AWS::Serverless::Api`
- Support for `maxLength`, `pattern`, and `excludedWords` rules.
- Customizable property name validation within `resource.Properties`.

### Fixed
- N/A

### Changed
- N/A

### Removed
- N/A
