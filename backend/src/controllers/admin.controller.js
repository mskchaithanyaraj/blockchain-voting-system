const blockchainService = require("../services/blockchain.service");
const { User } = require("../models");

/**
 * Admin Controller
 * Handles admin actions: add candidate, register voters, start/end election, get candidates/results
 */

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
    const tx = await blockchainService.startElection();
    return res.status(200).json({
      success: true,
      message: "Election started successfully",
      data: tx,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "StartElectionFailed",
      message: error.message,
    });
  }
};

// End the election
exports.endElection = async (req, res) => {
  try {
    const tx = await blockchainService.endElection();
    return res.status(200).json({
      success: true,
      message: "Election ended successfully",
      data: tx,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "EndElectionFailed",
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
