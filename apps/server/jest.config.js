export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/test/**/*.test.js"],
  setupFiles: ["<rootDir>/src/test/setup-env.js"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  testTimeout: 30000,
  maxWorkers: 2,
}
