const Voting = artifacts.require("Voting");
const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  console.log("\n========================================");
  console.log("🚀 Starting Voting Contract Deployment");
  console.log("========================================\n");

  console.log("Network:", network);
  console.log("Deployer Account:", accounts[0]);
  console.log("Available Accounts:", accounts.length);

  // Election name
  const electionName = "General Election 2025";

  console.log("\n📋 Deploying with parameters:");
  console.log("  Election Name:", electionName);

  // Deploy the Voting contract
  await deployer.deploy(Voting, electionName);
  const votingInstance = await Voting.deployed();

  console.log("\n✅ Contract Deployed Successfully!");
  console.log("📍 Contract Address:", votingInstance.address);
  console.log("👤 Admin Address:", accounts[0]);

  // Get contract ABI
  const votingArtifact = require("../build/contracts/Voting.json");

  // Prepare deployment info
  const deploymentInfo = {
    contractName: "Voting",
    contractAddress: votingInstance.address,
    abi: votingArtifact.abi,
    network: network,
    networkId: votingArtifact.networks[await web3.eth.net.getId()]?.networkId,
    deployedBy: accounts[0],
    deploymentTime: new Date().toISOString(),
    electionName: electionName,
    transactionHash:
      votingArtifact.networks[await web3.eth.net.getId()]?.transactionHash,
  };

  // Create deployment directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentFilePath = path.join(
    deploymentsDir,
    `voting-${network}.json`
  );
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:");
  console.log("  ", deploymentFilePath);

  // Also save a simplified version for frontend
  const frontendInfo = {
    contractAddress: votingInstance.address,
    abi: votingArtifact.abi,
    network: network,
    chainId: await web3.eth.getChainId(),
  };

  const frontendFilePath = path.join(deploymentsDir, "voting-contract.json");
  fs.writeFileSync(frontendFilePath, JSON.stringify(frontendInfo, null, 2));

  console.log("  ", frontendFilePath);

  // Display contract info
  console.log("\n📊 Contract Information:");
  console.log("  Election Name:", await votingInstance.electionName());
  console.log("  Admin:", await votingInstance.admin());
  console.log(
    "  Election State:",
    (await votingInstance.electionState()).toString()
  );
  console.log(
    "  Candidate Count:",
    (await votingInstance.candidateCount()).toString()
  );
  console.log(
    "  Registered Voters:",
    (await votingInstance.registeredVoterCount()).toString()
  );

  console.log("\n========================================");
  console.log("✨ Deployment Complete!");
  console.log("========================================\n");

  console.log("📝 Next Steps:");
  console.log(
    "  1. Update backend/.env with CONTRACT_ADDRESS:",
    votingInstance.address
  );
  console.log(
    "  2. Update frontend/.env with VITE_CONTRACT_ADDRESS:",
    votingInstance.address
  );
  console.log("  3. Check Ganache UI for transaction details");
  console.log("  4. Use the saved ABI in deployments/ folder\n");
};
