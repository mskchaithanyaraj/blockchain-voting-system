const blockchainService = require("../services/blockchain.service");
const User = require("../models/User.model");
const Vote = require("../models/Vote.model");
const { ethers } = require("ethers");

/**
 * Voter Controller
 * Handles voter actions: cast vote, get voter status, view candidates, check election state
 */

/**
 * Cast a vote for a candidate
 * @route POST /api/voter/vote
 */
exports.castVote = async (req, res) => {
  try {
    const { candidateId, voterPrivateKey } = req.body;
    const voterAddress = req.user.ethAddress;

    // Verify user is registered and hasn't voted
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "UserNotFound",
        message: "User not found",
      });
    }

    if (!user.isRegistered) {
      return res.status(403).json({
        success: false,
        error: "VoterNotRegistered",
        message: "You must be registered to vote",
      });
    }

    if (user.hasVoted) {
      return res.status(403).json({
        success: false,
        error: "AlreadyVoted",
        message: "You have already cast your vote",
      });
    }

    // Get candidate details before voting
    const candidate = await blockchainService.getCandidate(candidateId);
    if (!candidate || !candidate.name) {
      return res.status(404).json({
        success: false,
        error: "CandidateNotFound",
        message: "Candidate not found",
      });
    }

    // Cast vote on blockchain
    const tx = await blockchainService.castVote(voterPrivateKey, candidateId);

    // Get block details for the vote record
    const receipt = await blockchainService.getTransactionReceipt(
      tx.transactionHash
    );
    const block = await blockchainService
      .getProvider()
      .getBlock(receipt.blockNumber);

    // Create vote record in database
    const voteRecord = new Vote({
      voterAddress: voterAddress.toLowerCase(),
      userId: user._id,
      candidateId,
      candidateName: candidate.name,
      candidateParty: candidate.party,
      txHash: tx.transactionHash,
      blockNumber: tx.blockNumber,
      blockTimestamp: block ? new Date(block.timestamp * 1000) : new Date(),
      gasUsed: tx.gasUsed,
      electionId: "General Election 2025",
      isVerified: true,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
      },
    });

    await voteRecord.save();

    // Update user's voting status
    user.hasVoted = true;
    user.votedCandidateId = candidateId;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Vote cast successfully",
      data: {
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber,
        candidateId,
        candidateName: candidate.name,
        candidateParty: candidate.party,
        voteId: voteRecord._id,
      },
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    return res.status(500).json({
      success: false,
      error: "CastVoteFailed",
      message: error.message || "Failed to cast vote",
    });
  }
};

/**
 * Get voter status
 * @route GET /api/voter/status
 */
exports.getVoterStatus = async (req, res) => {
  try {
    // Normalize address to checksum format
    const voterAddress = ethers.getAddress(req.user.ethAddress);

    // Get status from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "UserNotFound",
        message: "User not found",
      });
    }

    // Get blockchain status for verification
    const blockchainStatus = await blockchainService.getVoter(voterAddress);

    // Get candidate details if voted
    let votedCandidate = null;
    if (user.hasVoted && user.votedCandidateId) {
      try {
        votedCandidate = await blockchainService.getCandidate(
          user.votedCandidateId
        );
      } catch (error) {
        console.error("Error fetching voted candidate:", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Voter status retrieved successfully",
      data: {
        voterAddress: ethers.getAddress(user.ethAddress),
        name: user.name,
        email: user.email,
        isRegistered: blockchainStatus.isRegistered, // Use blockchain as source of truth
        hasVoted: blockchainStatus.hasVoted, // Use blockchain as source of truth
        votedCandidateId: blockchainStatus.votedCandidateId, // Use blockchain as source of truth
        votedCandidate: votedCandidate
          ? {
              id: votedCandidate.id,
              name: votedCandidate.name,
              party: votedCandidate.party,
            }
          : null,
        blockchainVerification: {
          isRegistered: blockchainStatus.isRegistered,
          hasVoted: blockchainStatus.hasVoted,
          votedCandidateId: blockchainStatus.votedCandidateId,
        },
      },
    });
  } catch (error) {
    console.error("Error getting voter status:", error);
    return res.status(500).json({
      success: false,
      error: "GetVoterStatusFailed",
      message: error.message || "Failed to get voter status",
    });
  }
};

/**
 * Get all candidates
 * @route GET /api/voter/candidates
 */
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await blockchainService.getAllCandidates();

    return res.status(200).json({
      success: true,
      message: "Fetched all candidates",
      data: candidates,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return res.status(500).json({
      success: false,
      error: "GetCandidatesFailed",
      message: error.message || "Failed to fetch candidates",
    });
  }
};

/**
 * Get election state
 * @route GET /api/voter/election/state
 */
exports.getElectionState = async (req, res) => {
  try {
    const state = await blockchainService.getElectionState();
    const totalCandidates = await blockchainService.getCandidateCount();
    const totalVotes = await blockchainService.getTotalVotes();
    const electionName = await blockchainService.getElectionName();

    return res.status(200).json({
      success: true,
      message: "Election state retrieved successfully",
      data: {
        state,
        electionName,
        totalCandidates,
        totalVotes,
        isActive: state === "Active",
        hasEnded: state === "Ended",
        notStarted: state === "NotStarted",
      },
    });
  } catch (error) {
    console.error("Error fetching election state:", error);
    return res.status(500).json({
      success: false,
      error: "GetElectionStateFailed",
      message: error.message || "Failed to get election state",
    });
  }
};

/**
 * Get election results (only available after election ends)
 * @route GET /api/voter/results
 */
exports.getResults = async (req, res) => {
  try {
    // Check if election has ended
    const state = await blockchainService.getElectionState();
    if (state !== "Ended") {
      return res.status(403).json({
        success: false,
        error: "ElectionNotEnded",
        message: "Results are only available after the election ends",
      });
    }

    const results = await blockchainService.getResults();

    // Sort by vote count (descending)
    const sortedResults = results.sort((a, b) => b.voteCount - a.voteCount);

    // Calculate statistics
    const totalVotes = sortedResults.reduce(
      (sum, candidate) => sum + candidate.voteCount,
      0
    );
    const resultsWithPercentage = sortedResults.map((candidate) => ({
      ...candidate,
      percentage:
        totalVotes > 0
          ? ((candidate.voteCount / totalVotes) * 100).toFixed(2)
          : "0.00",
    }));

    return res.status(200).json({
      success: true,
      message: "Election results retrieved successfully",
      data: {
        results: resultsWithPercentage,
        totalVotes,
        electionState: state,
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return res.status(500).json({
      success: false,
      error: "GetResultsFailed",
      message: error.message || "Failed to fetch election results",
    });
  }
};

/**
 * Get voter's vote details (if they have voted)
 * @route GET /api/voter/my-vote
 */
exports.getMyVote = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find vote record
    const vote = await Vote.findOne({ userId }).populate(
      "userId",
      "name email ethAddress"
    );

    if (!vote) {
      return res.status(404).json({
        success: false,
        error: "VoteNotFound",
        message: "You have not cast your vote yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vote details retrieved successfully",
      data: {
        candidateId: vote.candidateId,
        candidateName: vote.candidateName,
        candidateParty: vote.candidateParty,
        transactionHash: vote.txHash,
        blockNumber: vote.blockNumber,
        timestamp: vote.createdAt,
        isVerified: vote.isVerified,
      },
    });
  } catch (error) {
    console.error("Error fetching vote details:", error);
    return res.status(500).json({
      success: false,
      error: "GetVoteDetailsFailed",
      message: error.message || "Failed to fetch vote details",
    });
  }
};
