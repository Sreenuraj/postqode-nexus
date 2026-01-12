const config = require('./package.json').jest;

module.exports = {
  ...config,
  testMatch: ['<rootDir>/src/integration/**/*.test.tsx'],
  setupFiles: ['./jest.setup.js'],
};
