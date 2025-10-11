const mongoose = require("mongoose");
require("dotenv").config();

// Import the ElectionHistory model
const ElectionHistory = require("./src/models/ElectionHistory.model");

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all election histories
    const histories = await ElectionHistory.find({}).sort({
      electionNumber: -1,
    });
    console.log(`📊 Total election histories: ${histories.length}`);

    histories.forEach((history) => {
      console.log(`\n📋 Election #${history.electionNumber}:`);
      console.log(`   Name: "${history.electionName}"`);
      console.log(`   Total Votes: ${history.totalVotes}`);
      console.log(`   Start Time: ${history.startTime}`);
      console.log(`   End Time: ${history.endTime}`);
      console.log(`   Archived At: ${history.archivedAt}`);
      console.log(`   Archived By: ${history.archivedBy}`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

checkDatabase();
