module.exports = {
    testEnvironment: "node",
    // setupFilesAfterEnv: ["./tests/setup.js"], // 你的 setup 初始化檔路徑
    testTimeout: 10000, // 根據 DB 操作，設定合理超時
    verbose: true,
};
