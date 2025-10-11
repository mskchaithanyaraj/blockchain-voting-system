const blockchainService = require("../services/blockchain.service");
const { User, ElectionHistory } = require("../models");

/**
 * Admin Controller
 * Handles admin actions: add candidate, register voters, start/end election, get candidates/results
 */

// Helper function to archive current election data
const archiveCurrentElection = async (archivedBy = "admin") => {
  try {
    console.log("🔄 Checking if election data needs backup...");
    const electionState = await blockchainService.getElectionState();
    const candidates = await blockchainService.getAllCandidates();

    // Only backup if there was actually an election (stateNumber = 2 means ended)
    if (electionState.stateNumber === 2 && electionState.totalVotes > 0) {
      // Check if this election is already archived
      const existingArchive = await ElectionHistory.findOne({
        electionName: electionState.name,
        startTime: new Date(electionState.startTime * 1000),
        endTime: new Date(electionState.endTime * 1000),
      });

      if (existingArchive) {
        console.log(
          `⚠️  Election already archived as Election #${existingArchive.electionNumber}`
        );
        return {
          archived: false,
          alreadyExists: true,
          electionNumber: existingArchive.electionNumber,
        };
      }

      console.log("📦 Backing up current election data...");

      // Get next election number
      const electionNumber = await ElectionHistory.getNextElectionNumber();

      // Determine winner
      const getWinner = () => {
        if (candidates.length === 0) return null;

        // Find the highest vote count
        const maxVotes = Math.max(
          ...candidates.map((candidate) => candidate.voteCount)
        );

        // Find all candidates with the highest vote count
        const winnersWithMaxVotes = candidates.filter(
          (candidate) => candidate.voteCount === maxVotes
        );

        // If multiple candidates have the same highest votes, it's a draw
        if (winnersWithMaxVotes.length > 1 && maxVotes > 0) {
          return {
            isDraw: true,
            candidates: winnersWithMaxVotes,
            voteCount: maxVotes,
          };
        }

        // If there's a clear winner, return it in the same structure
        if (winnersWithMaxVotes.length === 1 && maxVotes > 0) {
          return {
            isDraw: false,
            candidates: winnersWithMaxVotes,
            voteCount: maxVotes,
          };
        }

        // No votes cast
        return null;
      };

      const winner = getWinner();

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
        startTime: new Date(electionState.startTime * 1000), // Convert from Unix timestamp
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
        archivedBy,
      });

      await electionHistory.save();
      console.log(`✅ Election data backed up as Election #${electionNumber}`);
      return { archived: true, electionNumber };
    }

    console.log(
      "ℹ️  No election data to archive (election not ended or no votes cast)"
    );
    return { archived: false };
  } catch (error) {
    console.error("Error archiving election data:", error);
    throw error;
  }
};

// Add a new candidate
exports.addCandidate = async (req, res) => {
  try {
    const { name, party } = req.body;
    const tx = await blockchainService.addCandidate(name, party);
    return res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      data: tx,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "AddCandidateFailed",
      message: error.message,
    });
  }
};

// Register a single voter
exports.registerVoter = async (req, res) => {
  try {
    const { voterAddress } = req.body;
    const tx = await blockchainService.registerVoter(voterAddress);
    // Update User in DB
    await User.findOneAndUpdate(
      { ethAddress: voterAddress.toLowerCase() },
      { isRegistered: true },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Voter registered successfully",
      data: tx,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "RegisterVoterFailed",
      message: error.message,
    });
  }
};

// Register multiple voters in batch
exports.registerVotersBatch = async (req, res) => {
  try {
    const { voterAddresses } = req.body;
    const tx = await blockchainService.registerVotersBatch(voterAddresses);
    // Bulk update Users in DB
    await User.updateMany(
      { ethAddress: { $in: voterAddresses.map((a) => a.toLowerCase()) } },
      { isRegistered: true }
    );
    return res.status(200).json({
      success: true,
      message: `Batch registered ${voterAddresses.length} voters`,
      data: tx,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "RegisterVotersBatchFailed",
      message: error.message,
    });
  }
};

// Start the election
exports.startElection = async (req, res) => {
  try {
    const { electionName } = req.body;

    if (!electionName || electionName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Election name is required",
      });
    }

    const tx = await blockchainService.startElection(electionName.trim());
    return res.status(200).json({
      success: true,
      message: "Election started successfully",
      data: tx,
    });
  } catch (error) {
    console.error("Start election error:", error);

    // Determine appropriate HTTP status code based on error type
    let statusCode = 500;
    let errorType = "StartElectionFailed";

    if (
      error.message.includes("Cannot start election without candidates") ||
      error.message.includes("Cannot start election without registered voters")
    ) {
      statusCode = 400; // Bad Request - prerequisites not met
      errorType = "PrerequisitesNotMet";
    } else if (
      error.message.includes("Access denied") ||
      error.message.includes("Only admin")
    ) {
      statusCode = 403; // Forbidden
      errorType = "AccessDenied";
    } else if (error.message.includes("Election has already")) {
      statusCode = 409; // Conflict
      errorType = "ElectionStateConflict";
    }

    return res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message,
    });
  }
};

// End the election
exports.endElection = async (req, res) => {
  try {
    // First end the election on blockchain
    const tx = await blockchainService.endElection();

    // Then automatically archive the election data
    try {
      const archiveResult = await archiveCurrentElection(
        req.user?.ethAddress || "admin"
      );

      let message;
      if (archiveResult.archived) {
        message = `Election ended successfully and archived as Election #${archiveResult.electionNumber}`;
      } else if (archiveResult.alreadyExists) {
        message = `Election ended successfully (already archived as Election #${archiveResult.electionNumber})`;
      } else {
        message = "Election ended successfully";
      }

      return res.status(200).json({
        success: true,
        message,
        data: {
          ...tx,
          archived: archiveResult.archived || archiveResult.alreadyExists,
          electionNumber: archiveResult.electionNumber,
        },
      });
    } catch (archiveError) {
      console.error("Failed to archive election data:", archiveError);
      // Election ended successfully, but archiving failed - still return success
      return res.status(200).json({
        success: true,
        message: "Election ended successfully, but failed to archive data",
        data: tx,
        warning: "Archive failed: " + archiveError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "EndElectionFailed",
      message: error.message,
    });
  }
};

// Reset the election (with historical backup)
exports.resetElection = async (req, res) => {
  try {
    const { electionName } = req.body;
    if (!electionName || electionName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Election name is required",
      });
    }

    // Archive current election data if it exists (only if not already archived)
    let archiveResult = { archived: false };
    try {
      archiveResult = await archiveCurrentElection(
        req.user?.ethAddress || "admin"
      );
    } catch (archiveError) {
      console.error(
        "Failed to archive election data during reset:",
        archiveError
      );
      // Continue with reset even if archiving fails
    }

    // Now reset the blockchain
    const tx = await blockchainService.resetElection(electionName.trim());

    // Also reset user registration status in database
    await User.updateMany({}, { isRegistered: false });
    console.log("✅ Reset user registration status in database");

    return res.status(200).json({
      success: true,
      message: archiveResult.archived
        ? `Election reset successfully. Previous election data has been archived as Election #${archiveResult.electionNumber}.`
        : archiveResult.alreadyExists
        ? `Election reset successfully. Previous election data was already archived as Election #${archiveResult.electionNumber}.`
        : "Election reset successfully.",
      data: {
        ...tx,
        archived: archiveResult.archived || archiveResult.alreadyExists,
        electionNumber: archiveResult.electionNumber,
      },
    });
  } catch (error) {
    console.error("Reset election error:", error);
    return res.status(500).json({
      success: false,
      error: "ResetElectionFailed",
      message: error.message,
    });
  }
};

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await blockchainService.getAllCandidates();
    return res.status(200).json({
      success: true,
      message: "Fetched all candidates",
      data: candidates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "GetAllCandidatesFailed",
      message: error.message,
    });
  }
};

// Get election results
exports.getResults = async (req, res) => {
  try {
    const results = await blockchainService.getResults();
    return res.status(200).json({
      success: true,
      message: "Fetched election results",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "GetResultsFailed",
      message: error.message,
    });
  }
};

// Get election statistics
exports.getElectionStats = async (req, res) => {
  try {
    const stats = await blockchainService.getElectionState();
    return res.status(200).json({
      success: true,
      message: "Fetched election statistics",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "GetElectionStatsFailed",
      message: error.message,
    });
  }
};

// Get all registered voters with their details
exports.getRegisteredVoters = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Get registered voters from database with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const voters = await User.find({
      role: "voter",
      isRegistered: true,
    })
      .select("name email ethAddress hasVoted votedCandidateId createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalVoters = await User.countDocuments({
      role: "voter",
      isRegistered: true,
    });

    // Get voting statistics
    const totalRegistered = await User.countDocuments({
      role: "voter",
      isRegistered: true,
    });
    const totalVoted = await User.countDocuments({
      role: "voter",
      isRegistered: true,
      hasVoted: true,
    });

    const voterStats = {
      totalRegistered,
      totalVoted,
      pendingVotes: totalRegistered - totalVoted,
      turnoutPercentage:
        totalRegistered > 0
          ? ((totalVoted / totalRegistered) * 100).toFixed(2)
          : 0,
    };

    return res.status(200).json({
      success: true,
      message: "Fetched registered voters",
      data: {
        voters,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVoters / parseInt(limit)),
          totalVoters,
          hasNext: parseInt(page) * parseInt(limit) < totalVoters,
          hasPrev: parseInt(page) > 1,
        },
        statistics: voterStats,
      },
    });
  } catch (error) {
    console.error("Get registered voters error:", error);
    return res.status(500).json({
      success: false,
      error: "GetRegisteredVotersFailed",
      message: error.message,
    });
  }
};

// Get election history (all past elections)
exports.getElectionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-electionNumber" } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      lean: true,
    };

    // Use aggregation for better performance
    const elections = await ElectionHistory.find({}, null, {
      sort: { electionNumber: -1 },
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    const totalElections = await ElectionHistory.countDocuments();
    const electionStats = await ElectionHistory.getElectionStats();

    return res.status(200).json({
      success: true,
      message: "Fetched election history",
      data: {
        elections,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalElections / parseInt(limit)),
          totalElections,
          hasNext: parseInt(page) * parseInt(limit) < totalElections,
          hasPrev: parseInt(page) > 1,
        },
        statistics: electionStats,
      },
    });
  } catch (error) {
    console.error("Get election history error:", error);
    return res.status(500).json({
      success: false,
      error: "GetElectionHistoryFailed",
      message: error.message,
    });
  }
};

// Get specific election details from history
exports.getElectionById = async (req, res) => {
  try {
    const { electionNumber } = req.params;

    const election = await ElectionHistory.findOne({
      electionNumber: parseInt(electionNumber),
    });

    if (!election) {
      return res.status(404).json({
        success: false,
        error: "ElectionNotFound",
        message: `Election #${electionNumber} not found in history`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched election details",
      data: election,
    });
  } catch (error) {
    console.error("Get election by ID error:", error);
    return res.status(500).json({
      success: false,
      error: "GetElectionByIdFailed",
      message: error.message,
    });
  }
};

// Delete election from history (admin only - dangerous operation)
exports.deleteElectionHistory = async (req, res) => {
  try {
    const { electionNumber } = req.params;

    const deletedElection = await ElectionHistory.findOneAndDelete({
      electionNumber: parseInt(electionNumber),
    });

    if (!deletedElection) {
      return res.status(404).json({
        success: false,
        error: "ElectionNotFound",
        message: `Election #${electionNumber} not found in history`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Election #${electionNumber} deleted from history`,
      data: deletedElection,
    });
  } catch (error) {
    console.error("Delete election history error:", error);
    return res.status(500).json({
      success: false,
      error: "DeleteElectionHistoryFailed",
      message: error.message,
    });
  }
};
