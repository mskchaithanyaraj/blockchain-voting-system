const express = require("express");
const router = express.Router();

// Import controllers
const authController = require("../controllers/auth.controller");

// Import middleware
const { verifyToken } = require("../middleware/auth.middleware");
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require("../middleware/validation.middleware");

/**
 * Authentication Routes
 * Public routes for registration and login
 * Base path: /api/auth
 */

// ============================================
// Public Authentication Routes
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (admin or voter)
 * @access  Public
 */
router.post("/register", validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and receive JWT token
 * @access  Public
 */
router.post("/login", validateLogin, authController.login);

// ============================================
// Protected Profile Routes
// ============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user's profile
 * @access  Private (requires authentication)
 */
router.get("/profile", verifyToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user's profile
 * @access  Private (requires authentication)
 */
router.put(
  "/profile",
  verifyToken,
  validateUpdateProfile,
  authController.updateProfile
);

// ============================================
// Token Management Routes
// ============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private (requires authentication)
 */
router.post("/logout", verifyToken, authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private (requires authentication)
 */
router.post("/refresh-token", verifyToken, authController.refreshToken);

module.exports = router;
