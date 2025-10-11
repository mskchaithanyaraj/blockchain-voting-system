const express = require("express");
const router = express.Router();

// Import controllers
const adminController = require("../controllers/admin.controller");

// Import middleware
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const {
  validateAddCandidate,
  validateRegisterVoter,
  validateRegisterVotersBatch,
} = require("../middleware/validation.middleware");

/**
 * Admin Routes
 * All routes require authentication and admin role
 * Base path: /api/admin
 */

// ============================================
// Candidate Management Routes
// ============================================

/**
 * @route   POST /api/admin/candidates
 * @desc    Add a new candidate
 * @access  Admin only
 */
router.post(
  "/candidates",
  verifyToken,
  isAdmin,
  validateAddCandidate,
  adminController.addCandidate
);

/**
 * @route   GET /api/admin/candidates
 * @desc    Get all candidates
 * @access  Admin only
 */
router.get(
  "/candidates",
  verifyToken,
  isAdmin,
  adminController.getAllCandidates
);

// ============================================
// Voter Registration Routes
// ============================================

/**
 * @route   POST /api/admin/voters/register
 * @desc    Register a single voter
 * @access  Admin only
 */
router.post(
  "/voters/register",
  verifyToken,
  isAdmin,
  validateRegisterVoter,
  adminController.registerVoter
);

/**
 * @route   POST /api/admin/voters/register-batch
 * @desc    Register multiple voters in batch
 * @access  Admin only
 */
router.post(
  "/voters/register-batch",
  verifyToken,
  isAdmin,
  validateRegisterVotersBatch,
  adminController.registerVotersBatch
);

/**
 * @route   GET /api/admin/voters
 * @desc    Get all registered voters with their details
 * @access  Admin only
 */
router.get(
  "/voters",
  verifyToken,
  isAdmin,
  adminController.getRegisteredVoters
);

// ============================================
// Election Management Routes
// ============================================

/**
 * @route   POST /api/admin/election/start
 * @desc    Start the election
 * @access  Admin only
 */
router.post(
  "/election/start",
  verifyToken,
  isAdmin,
  adminController.startElection
);

/**
 * @route   POST /api/admin/election/end
 * @desc    End the election
 * @access  Admin only
 */
router.post("/election/end", verifyToken, isAdmin, adminController.endElection);

/**
 * @route   POST /api/admin/election/reset
 * @desc    Reset the election to start a new one
 * @access  Admin only
 */
router.post(
  "/election/reset",
  verifyToken,
  isAdmin,
  adminController.resetElection
);

/**
 * @route   GET /api/admin/election/results
 * @desc    Get election results
 * @access  Admin only
 */
router.get(
  "/election/results",
  verifyToken,
  isAdmin,
  adminController.getResults
);

/**
 * @route   GET /api/admin/election/stats
 * @desc    Get election statistics
 * @access  Admin only
 */
router.get(
  "/election/stats",
  verifyToken,
  isAdmin,
  adminController.getElectionStats
);

// ============================================
// Election History Routes
// ============================================

/**
 * @route   GET /api/admin/elections/history
 * @desc    Get election history (all past elections)
 * @access  Admin only
 */
router.get(
  "/elections/history",
  verifyToken,
  isAdmin,
  adminController.getElectionHistory
);

/**
 * @route   GET /api/admin/elections/history/:electionNumber
 * @desc    Get specific election details from history
 * @access  Admin only
 */
router.get(
  "/elections/history/:electionNumber",
  verifyToken,
  isAdmin,
  adminController.getElectionById
);

/**
 * @route   DELETE /api/admin/elections/history/:electionNumber
 * @desc    Delete election from history (dangerous operation)
 * @access  Admin only
 */
router.delete(
  "/elections/history/:electionNumber",
  verifyToken,
  isAdmin,
  adminController.deleteElectionHistory
);

module.exports = router;
