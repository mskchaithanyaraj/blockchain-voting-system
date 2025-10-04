const fs = require("fs");
const path = require("path");

/**
 * Post-deployment script to copy contract artifacts to backend and frontend
 */

console.log("\n📦 Copying deployment artifacts...\n");

// Paths
const deploymentsDir = path.join(__dirname, "..", "deployments");
const backendDir = path.join(__dirname, "..", "..", "backend", "contracts");
const frontendDir = path.join(
  __dirname,
  "..",
  "..",
  "frontend",
  "src",
  "contracts"
);

// Source file
const sourceFile = path.join(deploymentsDir, "voting-contract.json");

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error("❌ Error: voting-contract.json not found!");
  console.error("   Please run deployment first: npm run deploy:ganache");
  process.exit(1);
}

// Create backend directory if it doesn't exist
if (!fs.existsSync(backendDir)) {
  fs.mkdirSync(backendDir, { recursive: true });
  console.log("✅ Created backend/contracts directory");
}

// Create frontend directory if it doesn't exist
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
  console.log("✅ Created frontend/src/contracts directory");
}

// Copy to backend
const backendTarget = path.join(backendDir, "voting-contract.json");
fs.copyFileSync(sourceFile, backendTarget);
console.log("✅ Copied to:", backendTarget);

// Copy to frontend
const frontendTarget = path.join(frontendDir, "voting-contract.json");
fs.copyFileSync(sourceFile, frontendTarget);
console.log("✅ Copied to:", frontendTarget);

// Read and display contract address
const contractData = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
console.log("\n📍 Contract Address:", contractData.contractAddress);
console.log("🔗 Chain ID:", contractData.chainId);
console.log("🌐 Network:", contractData.network);

console.log(
  "\n✨ Done! Contract artifacts are ready for backend and frontend.\n"
);
