const jwt = require("jsonwebtoken");
const { User } = require("../models");
const config = require("../config");

/**
 * Authentication Middleware
 * Provides JWT token verification and role-based access control
 */

// ============================================
// Token Verification Middleware
// ============================================

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
        message: "Authorization header is missing",
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Invalid token format",
        message: "Token must be in Bearer format",
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token is empty",
        message: "Please provide a valid token",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expired",
          message: "Your session has expired. Please login again.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: "Invalid token",
          message: "Token verification failed",
        });
      }

      throw error;
    }

    // Get user from database
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
        message: "The user associated with this token no longer exists",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Account deactivated",
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

// ============================================
// Role-Based Access Control Middleware
// ============================================

/**
 * Check if user is an admin
 * Must be used after verifyToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = (req, res, next) => {
  try {
    // Check if user is attached (verifyToken should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User authentication required",
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message:
          "Admin access required. You do not have permission to perform this action.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization failed",
      message: "An error occurred during authorization",
    });
  }
};

/**
 * Check if user is a voter
 * Must be used after verifyToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isVoter = (req, res, next) => {
  try {
    // Check if user is attached (verifyToken should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User authentication required",
      });
    }

    // Check if user has voter role
    if (req.user.role !== "voter") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Voter access required. Only voters can perform this action.",
      });
    }

    next();
  } catch (error) {
    console.error("Voter check error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization failed",
      message: "An error occurred during authorization",
    });
  }
};

/**
 * Check if user is either admin or voter (authenticated user)
 * Must be used after verifyToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAuthenticated = (req, res, next) => {
  try {
    // Check if user is attached (verifyToken should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Check if user has a valid role
    if (!["admin", "voter"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Invalid user role",
      });
    }

    next();
  } catch (error) {
    console.error("Authentication check error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization failed",
      message: "An error occurred during authorization",
    });
  }
};

// ============================================
// Optional Authentication (No Error if Missing)
// ============================================

/**
 * Optional token verification
 * Attaches user if token is present and valid, but doesn't error if missing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no token, just continue without user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select("-passwordHash");

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token invalid or expired, continue without user
      req.user = null;
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    req.user = null;
    next();
  }
};

// ============================================
// Check Voter Registration Status
// ============================================

/**
 * Check if voter is registered on blockchain
 * Must be used after verifyToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isRegisteredVoter = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (req.user.role !== "voter") {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Only voters can access this resource",
      });
    }

    if (!req.user.isRegistered) {
      return res.status(403).json({
        success: false,
        error: "Not registered",
        message:
          "You must be registered to vote. Please contact an administrator.",
      });
    }

    next();
  } catch (error) {
    console.error("Registration check error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization failed",
      message: "An error occurred during authorization",
    });
  }
};

/**
 * Check if voter has not voted yet
 * Must be used after verifyToken middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const hasNotVoted = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    if (req.user.hasVoted) {
      return res.status(403).json({
        success: false,
        error: "Already voted",
        message:
          "You have already cast your vote. Each voter can only vote once.",
      });
    }

    next();
  } catch (error) {
    console.error("Vote status check error:", error);
    return res.status(500).json({
      success: false,
      error: "Authorization failed",
      message: "An error occurred during authorization",
    });
  }
};

// ============================================
// Export Middleware Functions
// ============================================

module.exports = {
  verifyToken,
  isAdmin,
  isVoter,
  isAuthenticated,
  optionalAuth,
  isRegisteredVoter,
  hasNotVoted,
};
