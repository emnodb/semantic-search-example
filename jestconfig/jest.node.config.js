module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  testPathIgnorePatterns: [
    'node_modules',
    '__mocks__',
    '__helpers__',
    '__fixtures__',
    '__resources__',
    'build',
    'dist',
    '\\.d\\.ts$',
  ],
  //   displayName: 'packages',
  //   rootDir: './',
  //   projects: ['<rootDir>/packages/jest.config.js'],
};
