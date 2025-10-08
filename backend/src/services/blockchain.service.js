const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
const config = require("../config");

// ============================================
// Load Contract ABI and Address
// ============================================

const contractArtifactPath = path.join(
  __dirname,
  "..",
  "..",
  "contracts",
  "voting-contract.json"
);

let contractABI;
let contractAddress;

try {
  const contractArtifact = JSON.parse(
    fs.readFileSync(contractArtifactPath, "utf8")
  );
  contractABI = contractArtifact.abi;
  contractAddress = contractArtifact.contractAddress;

  if (!contractABI || !contractAddress) {
    throw new Error("Contract ABI or address not found in artifact");
  }

  console.log("✅ Contract artifact loaded successfully");
  console.log(`   Contract Address: ${contractAddress}`);
} catch (error) {
  console.error("❌ Failed to load contract artifact:", error.message);
  throw new Error(
    "Contract artifact loading failed. Ensure contract is deployed and artifacts are copied."
  );
}

// ============================================
// Blockchain Connection Setup
// ============================================

let provider;
let adminWallet;
let contract;

/**
 * Initialize blockchain connection
 */
function initializeBlockchain() {
  try {
    // Create provider for Ganache
    provider = new ethers.JsonRpcProvider(config.ethRpcUrl);
    console.log("✅ Blockchain provider initialized");
    console.log(`   RPC URL: ${config.ethRpcUrl}`);

    // Create admin wallet from private key
    if (!config.adminPrivateKey) {
      throw new Error(
        "ADMIN_PRIVATE_KEY not configured in environment variables"
      );
    }

    adminWallet = new ethers.Wallet(config.adminPrivateKey, provider);
    console.log("✅ Admin wallet initialized");
    console.log(`   Admin Address: ${adminWallet.address}`);

    // Create contract instance with admin signer
    contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    console.log("✅ Contract instance created");

    return true;
  } catch (error) {
    console.error("❌ Blockchain initialization failed:", error.message);
    throw error;
  }
}

// Initialize on module load
initializeBlockchain();

// ============================================
// Getter Functions
// ============================================

/**
 * Get the contract instance
 * @returns {ethers.Contract} Contract instance
 */
function getContract() {
  return contract;
}

/**
 * Get the provider instance
 * @returns {ethers.JsonRpcProvider} Provider instance
 */
function getProvider() {
  return provider;
}

/**
 * Get the admin wallet/signer
 * @returns {ethers.Wallet} Admin wallet
 */
function getAdminSigner() {
  return adminWallet;
}

/**
 * Get contract address
 * @returns {string} Contract address
 */
function getContractAddress() {
  return contractAddress;
}

// ============================================
// Read-Only Functions (View Functions)
// ============================================

/**
 * Get all candidates
 * @returns {Promise<Array>} Array of candidates
 */
async function getAllCandidates() {
  try {
    const candidatesData = await contract.getAllCandidates();

    // The contract returns 4 arrays: [ids, names, parties, voteCounts]
    const [ids, names, parties, voteCounts] = candidatesData;

    // Format candidates data by combining the arrays
    const formattedCandidates = [];
    for (let i = 0; i < ids.length; i++) {
      formattedCandidates.push({
        id: Number(ids[i]),
        name: names[i],
        party: parties[i],
        voteCount: Number(voteCounts[i]),
      });
    }

    console.log(
      `📋 Fetched ${formattedCandidates.length} candidates from blockchain`
    );
    return formattedCandidates;
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw new Error(`Failed to fetch candidates: ${error.message}`);
  }
}

/**
 * Get a specific candidate by ID
 * @param {number} candidateId - Candidate ID
 * @returns {Promise<Object>} Candidate data
 */
async function getCandidate(candidateId) {
  try {
    const candidate = await contract.getCandidate(candidateId);

    return {
      id: Number(candidate.id),
      name: candidate.name,
      party: candidate.party,
      voteCount: Number(candidate.voteCount),
    };
  } catch (error) {
    console.error(`Error fetching candidate ${candidateId}:`, error);
    throw new Error(`Failed to fetch candidate: ${error.message}`);
  }
}

/**
 * Get current election state
 * @returns {Promise<string>} Election state (NotStarted, Active, Ended)
 */
async function getElectionState() {
  try {
    const state = await contract.getElectionState();
    const states = ["NotStarted", "Active", "Ended"];

    console.log(`🗳️  Election State: ${states[state]}`);
    return states[state];
  } catch (error) {
    console.error("Error fetching election state:", error);
    throw new Error(`Failed to fetch election state: ${error.message}`);
  }
}

/**
 * Get voter information
 * @param {string} voterAddress - Voter's Ethereum address
 * @returns {Promise<Object>} Voter data
 */
async function getVoter(voterAddress) {
  try {
    const voter = await contract.getVoter(voterAddress);

    return {
      isRegistered: voter.isRegistered,
      hasVoted: voter.hasVoted,
      votedCandidateId: Number(voter.votedCandidateId),
    };
  } catch (error) {
    console.error(`Error fetching voter ${voterAddress}:`, error);
    throw new Error(`Failed to fetch voter: ${error.message}`);
  }
}

/**
 * Get election results
 * @returns {Promise<Array>} Array of candidates with vote counts
 */
async function getResults() {
  try {
    const candidates = await contract.getResults();

    const formattedResults = candidates.map((candidate) => ({
      id: Number(candidate.id),
      name: candidate.name,
      party: candidate.party,
      voteCount: Number(candidate.voteCount),
    }));

    console.log(
      `📊 Fetched election results: ${formattedResults.length} candidates`
    );
    return formattedResults;
  } catch (error) {
    console.error("Error fetching results:", error);
    throw new Error(`Failed to fetch results: ${error.message}`);
  }
}

/**
 * Get total candidates count
 * @returns {Promise<number>} Total candidates
 */
async function getCandidateCount() {
  try {
    const count = await contract.candidateCount();
    return Number(count);
  } catch (error) {
    console.error("Error fetching candidate count:", error);
    throw new Error(`Failed to fetch candidate count: ${error.message}`);
  }
}

/**
 * Get total votes cast
 * @returns {Promise<number>} Total votes
 */
async function getTotalVotes() {
  try {
    const total = await contract.totalVotes();
    return Number(total);
  } catch (error) {
    console.error("Error fetching total votes:", error);
    throw new Error(`Failed to fetch total votes: ${error.message}`);
  }
}

/**
 * Get election name
 * @returns {Promise<string>} Election name
 */
async function getElectionName() {
  try {
    const name = await contract.electionName();
    return name;
  } catch (error) {
    console.error("Error fetching election name:", error);
    throw new Error(`Failed to fetch election name: ${error.message}`);
  }
}

// ============================================
// Write Functions (State-Changing Functions)
// ============================================

/**
 * Add a new candidate (Admin only)
 * @param {string} name - Candidate name
 * @param {string} party - Candidate party
 * @returns {Promise<Object>} Transaction receipt
 */
async function addCandidate(name, party) {
  try {
    console.log(`➕ Adding candidate: ${name} (${party})`);

    const tx = await contract.addCandidate(name, party);
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Candidate added successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error adding candidate:", error);
    throw new Error(`Failed to add candidate: ${error.message}`);
  }
}

/**
 * Register a voter (Admin only)
 * @param {string} voterAddress - Voter's Ethereum address
 * @returns {Promise<Object>} Transaction receipt
 */
async function registerVoter(voterAddress) {
  try {
    console.log(`📝 Registering voter: ${voterAddress}`);

    const tx = await contract.registerVoter(voterAddress);
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Voter registered successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error registering voter:", error);
    throw new Error(`Failed to register voter: ${error.message}`);
  }
}

/**
 * Register multiple voters in batch (Admin only)
 * @param {Array<string>} voterAddresses - Array of voter Ethereum addresses
 * @returns {Promise<Object>} Transaction receipt
 */
async function registerVotersBatch(voterAddresses) {
  try {
    console.log(`📝 Registering ${voterAddresses.length} voters in batch`);

    const tx = await contract.registerVotersBatch(voterAddresses);
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Voters registered successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      votersRegistered: voterAddresses.length,
    };
  } catch (error) {
    console.error("Error registering voters in batch:", error);
    throw new Error(`Failed to register voters: ${error.message}`);
  }
}

/**
 * Start the election (Admin only)
 * @returns {Promise<Object>} Transaction receipt
 */
async function startElection() {
  try {
    console.log("🚀 Starting election...");

    const tx = await contract.startElection();
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Election started successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error starting election:", error);
    throw new Error(`Failed to start election: ${error.message}`);
  }
}

/**
 * End the election (Admin only)
 * @returns {Promise<Object>} Transaction receipt
 */
async function endElection() {
  try {
    console.log("🏁 Ending election...");

    const tx = await contract.endElection();
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Election ended successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error ending election:", error);
    throw new Error(`Failed to end election: ${error.message}`);
  }
}

/**
 * Cast a vote (Voter only)
 * @param {string} voterPrivateKey - Voter's private key
 * @param {number} candidateId - Candidate ID to vote for
 * @returns {Promise<Object>} Transaction receipt
 */
async function castVote(voterPrivateKey, candidateId) {
  try {
    // Create voter wallet from private key
    const voterWallet = new ethers.Wallet(voterPrivateKey, provider);
    console.log(
      `🗳️  Casting vote from: ${voterWallet.address} for candidate: ${candidateId}`
    );

    // Create contract instance with voter signer
    const voterContract = new ethers.Contract(
      contractAddress,
      contractABI,
      voterWallet
    );

    const tx = await voterContract.castVote(candidateId);
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Vote cast successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      voterAddress: voterWallet.address,
      candidateId,
    };
  } catch (error) {
    console.error("Error casting vote:", error);
    throw new Error(`Failed to cast vote: ${error.message}`);
  }
}

/**
 * Change admin (Admin only)
 * @param {string} newAdminAddress - New admin's Ethereum address
 * @returns {Promise<Object>} Transaction receipt
 */
async function changeAdmin(newAdminAddress) {
  try {
    console.log(`🔄 Changing admin to: ${newAdminAddress}`);

    const tx = await contract.changeAdmin(newAdminAddress);
    console.log(`   Transaction hash: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(
      `✅ Admin changed successfully. Gas used: ${receipt.gasUsed.toString()}`
    );

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Error changing admin:", error);
    throw new Error(`Failed to change admin: ${error.message}`);
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if address is valid Ethereum address
 * @param {string} address - Ethereum address
 * @returns {boolean} True if valid
 */
function isValidAddress(address) {
  return ethers.isAddress(address);
}

/**
 * Get current block number
 * @returns {Promise<number>} Block number
 */
async function getCurrentBlockNumber() {
  try {
    const blockNumber = await provider.getBlockNumber();
    return blockNumber;
  } catch (error) {
    console.error("Error fetching block number:", error);
    throw new Error(`Failed to fetch block number: ${error.message}`);
  }
}

/**
 * Get transaction receipt
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction receipt
 */
async function getTransactionReceipt(txHash) {
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt;
  } catch (error) {
    console.error("Error fetching transaction receipt:", error);
    throw new Error(`Failed to fetch transaction receipt: ${error.message}`);
  }
}

// ============================================
// Module Exports
// ============================================

module.exports = {
  // Getter functions
  getContract,
  getProvider,
  getAdminSigner,
  getContractAddress,

  // Read functions
  getAllCandidates,
  getCandidate,
  getElectionState,
  getVoter,
  getResults,
  getCandidateCount,
  getTotalVotes,
  getElectionName,

  // Write functions
  addCandidate,
  registerVoter,
  registerVotersBatch,
  startElection,
  endElection,
  castVote,
  changeAdmin,

  // Utility functions
  isValidAddress,
  getCurrentBlockNumber,
  getTransactionReceipt,
};
