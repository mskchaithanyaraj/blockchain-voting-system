const mongoose = require("mongoose");
require("dotenv").config();

// Import models and services
const { ElectionHistory } = require("./src/models");
const blockchainService = require("./src/services/blockchain.service");

async function manualArchive() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🔍 Getting current election state...");
    const electionState = await blockchainService.getElectionState();
    console.log("Election State:", JSON.stringify(electionState, null, 2));

    console.log("🔍 Getting all candidates...");
    const candidates = await blockchainService.getAllCandidates();
    console.log("Candidates:", JSON.stringify(candidates, null, 2));

    // Check if this election should be archived
    if (electionState.stateNumber === 2 && electionState.totalVotes > 0) {
      console.log(
        "✅ Election is ended and has votes, proceeding with archiving..."
      );

      // Check if already archived
      const existingArchive = await ElectionHistory.findOne({
        electionName: electionState.name,
        totalVotes: electionState.totalVotes,
      });

      if (existingArchive) {
        console.log(
          "⚠️ Election already archived:",
          existingArchive.electionNumber
        );
        return;
      }

      // Get next election number
      const electionNumber = await ElectionHistory.getNextElectionNumber();
      console.log(`📊 Next election number: ${electionNumber}`);

      // Determine winner
      const getWinner = () => {
        if (candidates.length === 0) return null;
        const maxVotes = Math.max(...candidates.map((c) => c.voteCount));
        const winnersWithMaxVotes = candidates.filter(
          (c) => c.voteCount === maxVotes
        );
        if (winnersWithMaxVotes.length > 1 && maxVotes > 0) {
          return {
            isDraw: true,
            candidates: winnersWithMaxVotes,
            voteCount: maxVotes,
          };
        }
        return winnersWithMaxVotes.length > 0 ? winnersWithMaxVotes[0] : null;
      };

      const winner = getWinner();
      console.log("🏆 Winner:", JSON.stringify(winner, null, 2));

      // Calculate voter turnout
      const voterTurnout =
        electionState.registeredVoterCount > 0
          ? Math.round(
              (electionState.totalVotes / electionState.registeredVoterCount) *
                100
            )
          : 0;

      // Create historical record
      const electionHistory = new ElectionHistory({
        electionName: electionState.name,
        electionNumber,
        startTime: new Date(electionState.startTime * 1000),
        endTime: new Date(electionState.endTime * 1000),
        totalVotes: electionState.totalVotes,
        totalCandidates: candidates.length,
        totalRegisteredVoters: electionState.registeredVoterCount,
        voterTurnout,
        candidates: candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          party: candidate.party,
          voteCount: candidate.voteCount,
        })),
        winner: winner || { isDraw: false, candidates: [], voteCount: 0 },
        archivedBy: "manual-archive",
      });

      await electionHistory.save();
      console.log(
        `✅ Election archived successfully as Election #${electionNumber}`
      );
    } else {
      console.log("❌ Election cannot be archived:");
      console.log(
        `   State Number: ${electionState.stateNumber} (needs to be 2)`
      );
      console.log(
        `   Total Votes: ${electionState.totalVotes} (needs to be > 0)`
      );
    }
  } catch (error) {
    console.error("❌ Error during manual archive:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

manualArchive();
