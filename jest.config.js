const dotenv = require("dotenv");
dotenv.config({ path: ".env.test.local" });

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.integration.test.[jt]s?(x)"],
  setupFiles: ["dotenv/config"],
};
