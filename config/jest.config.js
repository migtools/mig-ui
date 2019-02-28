// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  coverageDirectory: "coverage",
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/../__mocks__/styleMock.js"
  },

  // The path to a module that runs some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: ["<rootDir>/test-setup.js"],

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // testEnvironmentOptions: {},
  snapshotSerializers: ["enzyme-to-json/serializer"],
  rootDir: "../src"
};
