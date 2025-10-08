const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  let votingInstance;
  const admin = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];

  beforeEach(async () => {
    votingInstance = await Voting.new("Test Election", { from: admin });
  });

  describe("Candidate Management", () => {
    it("should add candidate", async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.name, "Alice");
      assert.equal(candidate.party, "Party A");
    });

    it("should reject non-admin adding candidate", async () => {
      try {
        await votingInstance.addCandidate("Bob", "Party B", { from: voter1 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Only admin"));
      }
    });
  });

  describe("Voter Registration", () => {
    it("should register voter", async () => {
      await votingInstance.registerVoter(voter1, { from: admin });
      const voterDetails = await votingInstance.getVoter(voter1);
      assert.equal(voterDetails.isRegistered, true);
      assert.equal(voterDetails.hasVoted, false);
    });

    it("should prevent duplicate registration", async () => {
      await votingInstance.registerVoter(voter1, { from: admin });
      try {
        await votingInstance.registerVoter(voter1, { from: admin });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("already registered"));
      }
    });
  });

  describe("Voting", () => {
    beforeEach(async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection({ from: admin });
    });

    it("should allow registered voter to vote", async () => {
      await votingInstance.castVote(1, { from: voter1 });
      const voterDetails = await votingInstance.getVoter(voter1);
      assert.equal(voterDetails.hasVoted, true);

      const candidate = await votingInstance.getCandidate(1);
      assert.equal(candidate.voteCount.toNumber(), 1);
    });

    it("should prevent voting twice", async () => {
      await votingInstance.castVote(1, { from: voter1 });
      try {
        await votingInstance.castVote(1, { from: voter1 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("already voted"));
      }
    });

    it("should prevent unregistered voter from voting", async () => {
      try {
        await votingInstance.castVote(1, { from: voter2 });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("not registered"));
      }
    });
  });

  describe("Election Management", () => {
    it("should start election", async () => {
      // Need to add at least one candidate and one voter before starting
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });

      await votingInstance.startElection({ from: admin });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 1); // Active
    });

    it("should end election", async () => {
      // Need to add at least one candidate and one voter before starting
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });

      await votingInstance.startElection({ from: admin });
      await votingInstance.endElection({ from: admin });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 2); // Ended
    });
  });
});
