const mongoose = require("mongoose");
require("dotenv").config();

// Import the ElectionHistory model
const ElectionHistory = require("./src/models/ElectionHistory.model");

async function testElectionHistory() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/voting-system"
    );
    console.log("✅ Connected to MongoDB");

    // Check if there are any election histories
    const count = await ElectionHistory.countDocuments();
    console.log(`📊 Total election histories in database: ${count}`);

    if (count > 0) {
      const histories = await ElectionHistory.find({})
        .sort({ electionNumber: -1 })
        .limit(5);
      console.log("📋 Recent election histories:");
      histories.forEach((history) => {
        console.log(
          `  - Election #${history.electionNumber}: "${history.electionName}" (${history.totalVotes} votes)`
        );
      });
    } else {
      console.log("❌ No election histories found in database");

      // Let's create a test election history to verify the model works
      console.log("🔧 Creating test election history...");
      const testElection = new ElectionHistory({
        electionName: "Test Election",
        electionNumber: 1,
        startTime: new Date("2024-01-01T10:00:00Z"),
        endTime: new Date("2024-01-01T18:00:00Z"),
        totalVotes: 100,
        totalCandidates: 3,
        totalRegisteredVoters: 150,
        voterTurnout: 66.67,
        candidates: [
          { id: 1, name: "Alice", party: "Party A", voteCount: 45 },
          { id: 2, name: "Bob", party: "Party B", voteCount: 35 },
          { id: 3, name: "Charlie", party: "Party C", voteCount: 20 },
        ],
        winner: {
          isDraw: false,
          candidates: [
            { id: 1, name: "Alice", party: "Party A", voteCount: 45 },
          ],
          voteCount: 45,
        },
        archivedBy: "test-admin",
      });

      await testElection.save();
      console.log("✅ Test election history created successfully");

      // Verify it was created
      const newCount = await ElectionHistory.countDocuments();
      console.log(`📊 New total election histories: ${newCount}`);
    }
  } catch (error) {
    console.error("❌ Error testing election history:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testElectionHistory();
