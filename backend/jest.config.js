module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    testTimeout: 60000,
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { isolatedModules: true, diagnostics: { ignoreCodes: [151002] } }],
    },
};
