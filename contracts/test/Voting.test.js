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
    it("should start election with custom name", async () => {
      // Need to add at least one candidate and one voter before starting
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });

      await votingInstance.startElection("Custom Election 2025", {
        from: admin,
      });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 1); // Active
      assert.equal(state.name, "Custom Election 2025");
    });

    it("should end election", async () => {
      // Need to add at least one candidate and one voter before starting
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });

      await votingInstance.startElection("Test Election", { from: admin });
      await votingInstance.endElection({ from: admin });
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 2); // Ended
    });

    it("should reset election after it has ended", async () => {
      // Start and end an election first
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection("First Election", { from: admin });
      await votingInstance.castVote(1, { from: voter1 });
      await votingInstance.endElection({ from: admin });

      // Reset the election
      await votingInstance.resetElection("New Election 2025", { from: admin });

      // Check that election state has been reset
      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 0); // NotStarted
      assert.equal(state.name, "New Election 2025");
      assert.equal(state._candidateCount.toNumber(), 0);
      assert.equal(state._totalVotes.toNumber(), 0);
      assert.equal(state._registeredVoterCount.toNumber(), 0);

      // Check that voter is no longer registered
      const voter = await votingInstance.getVoter(voter1);
      assert.equal(voter.isRegistered, false);
      assert.equal(voter.hasVoted, false);
    });

    it("should not allow reset before election ends", async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection("Test Election", { from: admin });

      try {
        await votingInstance.resetElection("New Election", { from: admin });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Election has not ended"));
      }
    });

    it("should not allow reset with empty election name", async () => {
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection("Test Election", { from: admin });
      await votingInstance.endElection({ from: admin });

      try {
        await votingInstance.resetElection("", { from: admin });
        assert.fail("Should have thrown error");
      } catch (error) {
        assert(error.message.includes("Election name cannot be empty"));
      }
    });

    it("should allow full election cycle after reset", async () => {
      // First election
      await votingInstance.addCandidate("Alice", "Party A", { from: admin });
      await votingInstance.registerVoter(voter1, { from: admin });
      await votingInstance.startElection("First Election", { from: admin });
      await votingInstance.endElection({ from: admin });

      // Reset
      await votingInstance.resetElection("Second Election", { from: admin });

      // Second election - should work normally
      await votingInstance.addCandidate("Bob", "Party B", { from: admin });
      await votingInstance.registerVoter(voter2, { from: admin });
      await votingInstance.startElection("Second Election", { from: admin });

      const state = await votingInstance.getElectionState();
      assert.equal(state.state.toNumber(), 1); // Active
      assert.equal(state.name, "Second Election");
      assert.equal(state._candidateCount.toNumber(), 1);
      assert.equal(state._registeredVoterCount.toNumber(), 1);
    });
  });
});
