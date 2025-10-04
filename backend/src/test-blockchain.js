/**
 * Test script for blockchain service
 * Run this to verify blockchain service is working correctly
 */

require("dotenv").config();
const blockchainService = require("./services/blockchain.service");

async function testBlockchainService() {
  console.log("\n========================================");
  console.log("🧪 Testing Blockchain Service");
  console.log("========================================\n");

  try {
    // Test 1: Get Contract Address
    console.log("1️⃣  Testing: Get Contract Address");
    const contractAddress = blockchainService.getContractAddress();
    console.log(`   ✅ Contract Address: ${contractAddress}\n`);

    // Test 2: Get Election Name
    console.log("2️⃣  Testing: Get Election Name");
    const electionName = await blockchainService.getElectionName();
    console.log(`   ✅ Election Name: ${electionName}\n`);

    // Test 3: Get Election State
    console.log("3️⃣  Testing: Get Election State");
    const state = await blockchainService.getElectionState();
    console.log(`   ✅ Current State: ${state}\n`);

    // Test 4: Get All Candidates
    console.log("4️⃣  Testing: Get All Candidates");
    const candidates = await blockchainService.getAllCandidates();
    console.log(`   ✅ Total Candidates: ${candidates.length}`);
    if (candidates.length > 0) {
      candidates.forEach((c) => {
        console.log(
          `      - ID: ${c.id}, Name: ${c.name}, Party: ${c.party}, Votes: ${c.voteCount}`
        );
      });
    }
    console.log();

    // Test 5: Get Candidate Count
    console.log("5️⃣  Testing: Get Candidate Count");
    const count = await blockchainService.getCandidateCount();
    console.log(`   ✅ Candidate Count: ${count}\n`);

    // Test 6: Get Total Votes
    console.log("6️⃣  Testing: Get Total Votes");
    const totalVotes = await blockchainService.getTotalVotes();
    console.log(`   ✅ Total Votes Cast: ${totalVotes}\n`);

    // Test 7: Get Admin Address
    console.log("7️⃣  Testing: Get Admin Signer");
    const adminSigner = blockchainService.getAdminSigner();
    console.log(`   ✅ Admin Address: ${adminSigner.address}\n`);

    // Test 8: Get Current Block Number
    console.log("8️⃣  Testing: Get Current Block Number");
    const blockNumber = await blockchainService.getCurrentBlockNumber();
    console.log(`   ✅ Current Block: ${blockNumber}\n`);

    // Test 9: Validate Address
    console.log("9️⃣  Testing: Address Validation");
    const testAddress = "0x446995e992d953A6C56e8bABFBe3C5E21AcfF927";
    const isValid = blockchainService.isValidAddress(testAddress);
    console.log(`   ✅ Is "${testAddress}" valid? ${isValid}\n`);

    console.log("========================================");
    console.log("✅ All Tests Passed Successfully!");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

// Run tests
testBlockchainService();
