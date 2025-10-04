const express = require("express");
const router = express.Router();

// Import controllers
const voterController = require("../controllers/voter.controller");

// Import middleware
const {
  verifyToken,
  isVoter,
  isRegisteredVoter,
  hasNotVoted,
} = require("../middleware/auth.middleware");
const { validateCastVote } = require("../middleware/validation.middleware");

/**
 * Voter Routes
 * All routes require authentication and voter role
 * Base path: /api/voter
 */

// ============================================
// Voting Routes
// ============================================

/**
 * @route   POST /api/voter/vote
 * @desc    Cast a vote for a candidate
 * @access  Registered voters only (who haven't voted yet)
 */
router.post(
  "/vote",
  verifyToken,
  isVoter,
  isRegisteredVoter,
  hasNotVoted,
  validateCastVote,
  voterController.castVote
);

/**
 * @route   GET /api/voter/my-vote
 * @desc    Get voter's own vote details
 * @access  Voters only
 */
router.get("/my-vote", verifyToken, isVoter, voterController.getMyVote);

// ============================================
// Voter Status Routes
// ============================================

/**
 * @route   GET /api/voter/status
 * @desc    Get voter's registration and voting status
 * @access  Voters only
 */
router.get("/status", verifyToken, isVoter, voterController.getVoterStatus);

// ============================================
// Candidate Information Routes
// ============================================

/**
 * @route   GET /api/voter/candidates
 * @desc    Get all candidates
 * @access  Voters only
 */
router.get("/candidates", verifyToken, isVoter, voterController.getCandidates);

// ============================================
// Election Information Routes
// ============================================

/**
 * @route   GET /api/voter/election/state
 * @desc    Get current election state and statistics
 * @access  Voters only
 */
router.get(
  "/election/state",
  verifyToken,
  isVoter,
  voterController.getElectionState
);

/**
 * @route   GET /api/voter/results
 * @desc    Get election results (only available after election ends)
 * @access  Voters only
 */
router.get("/results", verifyToken, isVoter, voterController.getResults);

module.exports = router;
