const jwt = require("jsonwebtoken");
const { User } = require("../models");
const config = require("../config");

/**
 * Auth Controller
 * Handles authentication: register, login, profile management
 */

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, ethAddress, role } = req.body;

    // Check if user with email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "EmailAlreadyExists",
        message: "An account with this email already exists",
      });
    }

    // Check if user with Ethereum address already exists
    const existingEthAddress = await User.findByEthAddress(ethAddress);
    if (existingEthAddress) {
      return res.status(400).json({
        success: false,
        error: "EthAddressAlreadyExists",
        message: "An account with this Ethereum address already exists",
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      ethAddress,
      role: role || "voter", // Default to voter if not specified
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(user.generateJWTPayload(), config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "RegistrationFailed",
      message: error.message || "Failed to register user",
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "InvalidCredentials",
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "AccountDeactivated",
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "InvalidCredentials",
        message: "Invalid email or password",
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(user.generateJWTPayload(), config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "LoginFailed",
      message: error.message || "Failed to login",
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "UserNotFound",
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      error: "GetProfileFailed",
      message: error.message || "Failed to get profile",
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const userId = req.user.id;

    // Build update object with only allowed fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "NoUpdatesProvided",
        message: "No valid fields provided for update",
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "UserNotFound",
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      error: "UpdateProfileFailed",
      message: error.message || "Failed to update profile",
    });
  }
};

/**
 * Logout user (client-side token removal)
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // Since we're using JWT, actual logout happens on client-side by removing the token
    // This endpoint can be used for logging purposes or future session management

    return res.status(200).json({
      success: true,
      message:
        "Logout successful. Please remove your token on the client side.",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "LogoutFailed",
      message: error.message || "Failed to logout",
    });
  }
};

/**
 * Refresh JWT token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "UserNotFound",
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "AccountDeactivated",
        message: "Your account has been deactivated",
      });
    }

    // Generate new JWT token
    const token = jwt.sign(user.generateJWTPayload(), config.jwtSecret, {
      expiresIn: config.jwtExpiry,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token,
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      error: "RefreshTokenFailed",
      message: error.message || "Failed to refresh token",
    });
  }
};
