const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * Stores user authentication data and role information
 * Links users to their Ethereum addresses for voting
 */
const userSchema = new mongoose.Schema(
  {
    // Ethereum wallet address (unique identifier)
    ethAddress: {
      type: String,
      required: [true, "Ethereum address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Basic Ethereum address validation (0x + 40 hex characters)
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Ethereum address!`,
      },
      index: true,
    },

    // User's full name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // Email address for communication
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
      index: true,
    },

    // Hashed password for authentication
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    // User role: 'admin' or 'voter'
    role: {
      type: String,
      enum: {
        values: ["admin", "voter"],
        message: "{VALUE} is not a valid role. Must be either admin or voter.",
      },
      default: "voter",
      required: true,
      index: true,
    },

    // Registration status on blockchain
    isRegistered: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Whether the user has cast their vote
    hasVoted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Candidate ID the user voted for (if voted)
    votedCandidateId: {
      type: Number,
      default: null,
    },

    // Additional user information (optional)
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // Profile picture URL (optional)
    profilePicture: {
      type: String,
      default: null,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Last login timestamp
    lastLogin: {
      type: Date,
      default: null,
    },

    // Password reset token and expiry (for future implementation)
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "users",
  }
);

// ============================================
// Indexes for Performance
// ============================================

// Compound index for queries filtering by role and registration status
userSchema.index({ role: 1, isRegistered: 1 });

// Compound index for voter queries
userSchema.index({ role: 1, hasVoted: 1 });

// ============================================
// Instance Methods
// ============================================

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

/**
 * Generate JWT payload for this user
 * @returns {Object} JWT payload
 */
userSchema.methods.generateJWTPayload = function () {
  return {
    id: this._id,
    ethAddress: this.ethAddress,
    email: this.email,
    role: this.role,
    name: this.name,
  };
};

/**
 * Get public profile (without sensitive data)
 * @returns {Object} Public user profile
 */
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    ethAddress: this.ethAddress,
    name: this.name,
    email: this.email,
    role: this.role,
    isRegistered: this.isRegistered,
    hasVoted: this.hasVoted,
    isActive: this.isActive,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

// ============================================
// Static Methods
// ============================================

/**
 * Find user by Ethereum address
 * @param {string} ethAddress - Ethereum address
 * @returns {Promise<Object>} User document
 */
userSchema.statics.findByEthAddress = function (ethAddress) {
  return this.findOne({ ethAddress: ethAddress.toLowerCase() });
};

/**
 * Find user by email
 * @param {string} email - Email address
 * @returns {Promise<Object>} User document
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Get all registered voters
 * @returns {Promise<Array>} Array of registered voters
 */
userSchema.statics.getRegisteredVoters = function () {
  return this.find({ role: "voter", isRegistered: true, isActive: true });
};

/**
 * Get all voters who have voted
 * @returns {Promise<Array>} Array of voters who cast their vote
 */
userSchema.statics.getVotedVoters = function () {
  return this.find({ role: "voter", hasVoted: true });
};

/**
 * Get voting statistics
 * @returns {Promise<Object>} Voting stats
 */
userSchema.statics.getVotingStats = async function () {
  const totalVoters = await this.countDocuments({ role: "voter" });
  const registeredVoters = await this.countDocuments({
    role: "voter",
    isRegistered: true,
  });
  const votedVoters = await this.countDocuments({
    role: "voter",
    hasVoted: true,
  });

  return {
    totalVoters,
    registeredVoters,
    votedVoters,
    pendingVoters: registeredVoters - votedVoters,
    turnoutPercentage:
      registeredVoters > 0
        ? ((votedVoters / registeredVoters) * 100).toFixed(2)
        : 0,
  };
};

// ============================================
// Middleware Hooks
// ============================================

/**
 * Pre-save hook to hash password before saving
 */
userSchema.pre("save", async function (next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save hook to convert ethAddress and email to lowercase
 */
userSchema.pre("save", function (next) {
  if (this.ethAddress) {
    this.ethAddress = this.ethAddress.toLowerCase();
  }
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// ============================================
// Virtual Properties
// ============================================

/**
 * Virtual property to check if user is admin
 */
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

/**
 * Virtual property to check if user is voter
 */
userSchema.virtual("isVoter").get(function () {
  return this.role === "voter";
});

// ============================================
// JSON Transformation
// ============================================

/**
 * Transform output when converting to JSON
 * Removes sensitive fields
 */
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.passwordHash;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  },
});

// ============================================
// Export Model
// ============================================

const User = mongoose.model("User", userSchema);

module.exports = User;
