const baseConfig = require('./jestconfig/jest.node.config');

module.exports = {
  ...baseConfig,
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    // This regex matches any file within the @hono/openapi directory that ends with .js or .j
    // The '^' symbol indicates the start of a string.
    // The '.*' symbol matches any character (except newline) zero or more times.
    // The '@hono/openapi/' matches files within the @hono/openapi directory.
    // The '.+' symbol matches any character (except newline) one or more times.
    // The '\\.js' matches the .js extension of a file.
    // The '?' symbol makes the 's' optional, so it matches both .js and .j files.
    // The '$' symbol indicates the end of a string.
    // So, this regex will match any string (in this case file name) within the @hono/openapi directory that ends with .js or .j
    '^.*@hono/zod-openapi/.+\\.js?$': 'ts-jest',
  },
  displayName: '@emno/server-api',
};
