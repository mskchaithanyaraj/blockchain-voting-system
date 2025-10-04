const blockchainService = require("./blockchain.service");
const { User, Vote } = require("../models");

/**
 * Blockchain Event Listener Service
 * Listens to smart contract events and updates database accordingly
 */

let isListening = false;
let contract = null;

/**
 * Initialize event listeners for blockchain events
 */
async function startListening() {
  if (isListening) {
    console.log("⚠️  Event listeners are already running");
    return;
  }

  try {
    contract = blockchainService.getContract();
    const provider = blockchainService.getProvider();

    console.log("\n========================================");
    console.log("🎧 Starting Blockchain Event Listeners");
    console.log("========================================");

    // Listen for VoterRegistered events
    contract.on("VoterRegistered", async (voterAddress, event) => {
      try {
        console.log(`\n📝 VoterRegistered Event Detected:`);
        console.log(`   Voter Address: ${voterAddress}`);
        console.log(`   Block Number: ${event.log.blockNumber}`);
        console.log(`   Transaction Hash: ${event.log.transactionHash}`);

        // Update user registration status in database
        const result = await User.findOneAndUpdate(
          { ethAddress: voterAddress.toLowerCase() },
          { isRegistered: true },
          { new: true }
        );

        if (result) {
          console.log(`✅ Database updated: ${result.name} is now registered`);
        } else {
          console.log(
            `⚠️  User not found in database for address: ${voterAddress}`
          );
        }
      } catch (error) {
        console.error(
          "❌ Error handling VoterRegistered event:",
          error.message
        );
      }
    });

    // Listen for VoteCast events
    contract.on(
      "VoteCast",
      async (voterAddress, candidateId, candidateName, event) => {
        try {
          console.log(`\n🗳️  VoteCast Event Detected:`);
          console.log(`   Voter Address: ${voterAddress}`);
          console.log(`   Candidate ID: ${candidateId.toString()}`);
          console.log(`   Candidate Name: ${candidateName}`);
          console.log(`   Block Number: ${event.log.blockNumber}`);
          console.log(`   Transaction Hash: ${event.log.transactionHash}`);

          // Get transaction receipt for additional details
          const receipt = await provider.getTransactionReceipt(
            event.log.transactionHash
          );
          const block = await provider.getBlock(event.log.blockNumber);

          // Find user in database
          const user = await User.findOne({
            ethAddress: voterAddress.toLowerCase(),
          });

          if (!user) {
            console.log(
              `⚠️  User not found in database for address: ${voterAddress}`
            );
            return;
          }

          // Get candidate details
          const candidate = await blockchainService.getCandidate(
            Number(candidateId)
          );

          // Check if vote already exists
          const existingVote = await Vote.findOne({
            txHash: event.log.transactionHash.toLowerCase(),
          });

          if (existingVote) {
            console.log(`⚠️  Vote already recorded in database`);
            return;
          }

          // Create vote record
          const voteRecord = new Vote({
            voterAddress: voterAddress.toLowerCase(),
            userId: user._id,
            candidateId: Number(candidateId),
            candidateName: candidate.name,
            candidateParty: candidate.party,
            txHash: event.log.transactionHash.toLowerCase(),
            blockNumber: event.log.blockNumber,
            blockTimestamp: block
              ? new Date(block.timestamp * 1000)
              : new Date(),
            gasUsed: receipt.gasUsed.toString(),
            electionId: "General Election 2025",
            isVerified: true,
          });

          await voteRecord.save();

          // Update user voting status
          user.hasVoted = true;
          user.votedCandidateId = Number(candidateId);
          await user.save();

          console.log(`✅ Vote recorded in database for ${user.name}`);
        } catch (error) {
          console.error("❌ Error handling VoteCast event:", error.message);
        }
      }
    );

    // Listen for ElectionStarted events
    contract.on("ElectionStarted", async (electionName, event) => {
      try {
        console.log(`\n🚀 ElectionStarted Event Detected:`);
        console.log(`   Election Name: ${electionName}`);
        console.log(`   Block Number: ${event.log.blockNumber}`);
        console.log(`   Transaction Hash: ${event.log.transactionHash}`);
        console.log(`✅ Election has officially started!`);
      } catch (error) {
        console.error(
          "❌ Error handling ElectionStarted event:",
          error.message
        );
      }
    });

    // Listen for ElectionEnded events
    contract.on("ElectionEnded", async (electionName, event) => {
      try {
        console.log(`\n🏁 ElectionEnded Event Detected:`);
        console.log(`   Election Name: ${electionName}`);
        console.log(`   Block Number: ${event.log.blockNumber}`);
        console.log(`   Transaction Hash: ${event.log.transactionHash}`);
        console.log(`✅ Election has officially ended!`);

        // Get final results
        const results = await blockchainService.getResults();
        console.log(`\n📊 Final Results:`);
        results.forEach((candidate, index) => {
          console.log(
            `   ${index + 1}. ${candidate.name} (${candidate.party}): ${
              candidate.voteCount
            } votes`
          );
        });
      } catch (error) {
        console.error("❌ Error handling ElectionEnded event:", error.message);
      }
    });

    // Listen for CandidateAdded events
    contract.on("CandidateAdded", async (candidateId, name, party, event) => {
      try {
        console.log(`\n➕ CandidateAdded Event Detected:`);
        console.log(`   Candidate ID: ${candidateId.toString()}`);
        console.log(`   Name: ${name}`);
        console.log(`   Party: ${party}`);
        console.log(`   Block Number: ${event.log.blockNumber}`);
        console.log(`   Transaction Hash: ${event.log.transactionHash}`);
        console.log(`✅ New candidate added to election`);
      } catch (error) {
        console.error("❌ Error handling CandidateAdded event:", error.message);
      }
    });

    // Listen for AdminChanged events
    contract.on("AdminChanged", async (oldAdmin, newAdmin, event) => {
      try {
        console.log(`\n🔄 AdminChanged Event Detected:`);
        console.log(`   Old Admin: ${oldAdmin}`);
        console.log(`   New Admin: ${newAdmin}`);
        console.log(`   Block Number: ${event.log.blockNumber}`);
        console.log(`   Transaction Hash: ${event.log.transactionHash}`);
        console.log(`✅ Admin privileges transferred`);
      } catch (error) {
        console.error("❌ Error handling AdminChanged event:", error.message);
      }
    });

    isListening = true;
    console.log("✅ All event listeners started successfully");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Failed to start event listeners:", error.message);
    throw error;
  }
}

/**
 * Stop listening to blockchain events
 */
function stopListening() {
  if (!isListening || !contract) {
    console.log("⚠️  Event listeners are not running");
    return;
  }

  try {
    // Remove all listeners
    contract.removeAllListeners("VoterRegistered");
    contract.removeAllListeners("VoteCast");
    contract.removeAllListeners("ElectionStarted");
    contract.removeAllListeners("ElectionEnded");
    contract.removeAllListeners("CandidateAdded");
    contract.removeAllListeners("AdminChanged");

    isListening = false;
    console.log("✅ All event listeners stopped");
  } catch (error) {
    console.error("❌ Error stopping event listeners:", error.message);
    throw error;
  }
}

/**
 * Check if event listeners are running
 * @returns {boolean} True if listening
 */
function isEventListenersActive() {
  return isListening;
}

/**
 * Restart event listeners (stop and start again)
 */
async function restartListening() {
  console.log("🔄 Restarting event listeners...");
  stopListening();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
  await startListening();
}

module.exports = {
  startListening,
  stopListening,
  restartListening,
  isEventListenersActive,
};
