#!/usr/bin/env node

/**
 * Test script to check the getResults function directly
 */

const blockchainService = require("./src/services/blockchain.service");

async function testResults() {
  console.log("🧪 Testing blockchain getResults function...\n");

  try {
    // Test getResults function
    console.log("📊 Calling getResults...");
    const results = await blockchainService.getResults();

    console.log("\n✅ Results Retrieved Successfully!");
    console.log("📄 Results Data:");
    console.log(JSON.stringify(results, null, 2));

    // Check if we have vote counts
    const totalVotes = results.reduce(
      (sum, candidate) => sum + candidate.voteCount,
      0
    );
    console.log(`\n📈 Total votes across all candidates: ${totalVotes}`);

    // Find winner
    const winner = results.reduce((max, candidate) =>
      candidate.voteCount > max.voteCount ? candidate : max
    );
    console.log(
      `🏆 Winner: ${winner.name} (${winner.party}) with ${winner.voteCount} votes`
    );
  } catch (error) {
    console.error("❌ Error testing results:", error.message);
    console.error("Full error:", error);
  }
}

// Run the test
testResults()
  .then(() => {
    console.log("\n🎯 Test completed");
  })
  .catch((error) => {
    console.error("\n💥 Test failed:", error);
  });
