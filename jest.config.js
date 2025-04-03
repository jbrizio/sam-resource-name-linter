export const testMatch = ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.test.mjs'];
export const transformIgnorePatterns = ['<rootDir>/node_modules/'];
export const transform = { '^.+\\.mjs$': 'babel-jest' };
export const coveragePathIgnorePatterns = ['/schemas/'];
export const moduleFileExtensions = ['js', 'mjs'];