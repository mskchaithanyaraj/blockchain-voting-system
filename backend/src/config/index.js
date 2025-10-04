require("dotenv").config();

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Frontend Configuration
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Database Configuration
  mongoUri: process.env.MONGO_URI || "",

  // Blockchain Configuration
  ethRpcUrl: process.env.ETH_RPC_URL || "http://127.0.0.1:7545",
  contractAddress:
    process.env.CONTRACT_ADDRESS ||
    "0x70905eA57Fe75D8da97C948A329ad079B9941Ce7",
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || "",
  chainId: process.env.CHAIN_ID || 1337,

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiry: process.env.JWT_EXPIRY || "24h",

  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};

// Validation function
const validateConfig = () => {
  const requiredFields = ["mongoUri", "adminPrivateKey", "jwtSecret"];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    console.warn("\n⚠️  Warning: Missing required environment variables:");
    missingFields.forEach((field) => {
      console.warn(`   - ${field.toUpperCase()}`);
    });
    console.warn("   Please add these to your .env file\n");
    return false;
  }

  return true;
};

// Export config and validation function
module.exports = {
  ...config,
  validateConfig,
  isConfigured: validateConfig,
};
