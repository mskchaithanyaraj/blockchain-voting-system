const mongoose = require("mongoose");

/**
 * Vote Schema
 * Stores all votes cast in the election with blockchain transaction details
 * Provides audit trail and analytics capabilities
 */
const voteSchema = new mongoose.Schema(
  {
    // Voter's Ethereum address
    voterAddress: {
      type: String,
      required: [true, "Voter address is required"],
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

    // Reference to User document (optional, for relational queries)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Candidate ID voted for
    candidateId: {
      type: Number,
      required: [true, "Candidate ID is required"],
      min: [1, "Candidate ID must be at least 1"],
      index: true,
    },

    // Candidate details (cached for faster queries)
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    candidateParty: {
      type: String,
      required: true,
      trim: true,
    },

    // Blockchain transaction hash
    txHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Transaction hash validation (0x + 64 hex characters)
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid transaction hash!`,
      },
      index: true,
    },

    // Block number where transaction was mined
    blockNumber: {
      type: Number,
      required: [true, "Block number is required"],
      min: 0,
      index: true,
    },

    // Block timestamp (from blockchain)
    blockTimestamp: {
      type: Date,
      default: null,
    },

    // Gas used for the transaction
    gasUsed: {
      type: String,
      default: null,
    },

    // Election ID/Name (for supporting multiple elections in future)
    electionId: {
      type: String,
      default: "General Election 2025",
      index: true,
    },

    // Vote verification status
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Additional metadata
    metadata: {
      // IP address (for audit, but anonymized)
      ipAddress: {
        type: String,
        default: null,
      },

      // User agent
      userAgent: {
        type: String,
        default: null,
      },

      // Vote cast location (optional)
      location: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "votes",
  }
);

// ============================================
// Indexes for Performance
// ============================================

// Compound index for voter queries
voteSchema.index({ voterAddress: 1, electionId: 1 });

// Compound index for candidate analytics
voteSchema.index({ candidateId: 1, electionId: 1 });

// Compound index for time-based queries
voteSchema.index({ createdAt: -1, electionId: 1 });

// Compound index for blockchain verification
voteSchema.index({ txHash: 1, blockNumber: 1 });

// ============================================
// Static Methods
// ============================================

/**
 * Find vote by transaction hash
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Vote document
 */
voteSchema.statics.findByTxHash = function (txHash) {
  return this.findOne({ txHash: txHash.toLowerCase() });
};

/**
 * Find all votes by voter address
 * @param {string} voterAddress - Voter's Ethereum address
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Array>} Array of votes
 */
voteSchema.statics.findByVoter = function (voterAddress, electionId = null) {
  const query = { voterAddress: voterAddress.toLowerCase() };
  if (electionId) {
    query.electionId = electionId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Find all votes for a specific candidate
 * @param {number} candidateId - Candidate ID
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Array>} Array of votes
 */
voteSchema.statics.findByCandidate = function (candidateId, electionId = null) {
  const query = { candidateId };
  if (electionId) {
    query.electionId = electionId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Get vote counts by candidate
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Array>} Array of candidate vote counts
 */
voteSchema.statics.getVoteCountsByCandidate = function (electionId = null) {
  const match = electionId ? { electionId } : {};

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$candidateId",
        candidateName: { $first: "$candidateName" },
        candidateParty: { $first: "$candidateParty" },
        voteCount: { $sum: 1 },
        lastVoteTime: { $max: "$createdAt" },
      },
    },
    {
      $sort: { voteCount: -1 },
    },
    {
      $project: {
        _id: 0,
        candidateId: "$_id",
        candidateName: 1,
        candidateParty: 1,
        voteCount: 1,
        lastVoteTime: 1,
      },
    },
  ]);
};

/**
 * Get total vote count
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<number>} Total votes
 */
voteSchema.statics.getTotalVotes = function (electionId = null) {
  const query = electionId ? { electionId } : {};
  return this.countDocuments(query);
};

/**
 * Get voting statistics
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Object>} Voting statistics
 */
voteSchema.statics.getVotingStatistics = async function (electionId = null) {
  const match = electionId ? { electionId } : {};

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalVotes: { $sum: 1 },
        uniqueVoters: { $addToSet: "$voterAddress" },
        firstVote: { $min: "$createdAt" },
        lastVote: { $max: "$createdAt" },
        avgBlockNumber: { $avg: "$blockNumber" },
      },
    },
    {
      $project: {
        _id: 0,
        totalVotes: 1,
        uniqueVoters: { $size: "$uniqueVoters" },
        firstVote: 1,
        lastVote: 1,
        avgBlockNumber: { $round: ["$avgBlockNumber", 0] },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        totalVotes: 0,
        uniqueVoters: 0,
        firstVote: null,
        lastVote: null,
        avgBlockNumber: 0,
      };
};

/**
 * Get votes by time period (hourly breakdown)
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Array>} Votes grouped by hour
 */
voteSchema.statics.getVotesByTimePeriod = function (electionId = null) {
  const match = electionId ? { electionId } : {};

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 },
    },
  ]);
};

/**
 * Check if voter has already voted
 * @param {string} voterAddress - Voter's Ethereum address
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<boolean>} True if voted
 */
voteSchema.statics.hasVoted = async function (voterAddress, electionId = null) {
  const query = { voterAddress: voterAddress.toLowerCase() };
  if (electionId) {
    query.electionId = electionId;
  }
  const count = await this.countDocuments(query);
  return count > 0;
};

/**
 * Get recent votes
 * @param {number} limit - Number of votes to fetch
 * @param {string} electionId - Election ID (optional)
 * @returns {Promise<Array>} Recent votes
 */
voteSchema.statics.getRecentVotes = function (limit = 10, electionId = null) {
  const query = electionId ? { electionId } : {};
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      "voterAddress candidateName candidateParty txHash blockNumber createdAt"
    );
};

// ============================================
// Instance Methods
// ============================================

/**
 * Get vote summary
 * @returns {Object} Vote summary
 */
voteSchema.methods.getSummary = function () {
  return {
    id: this._id,
    voterAddress: this.voterAddress,
    candidateId: this.candidateId,
    candidateName: this.candidateName,
    candidateParty: this.candidateParty,
    txHash: this.txHash,
    blockNumber: this.blockNumber,
    timestamp: this.createdAt,
    electionId: this.electionId,
  };
};

// ============================================
// Middleware Hooks
// ============================================

/**
 * Pre-save hook to convert addresses to lowercase
 */
voteSchema.pre("save", function (next) {
  if (this.voterAddress) {
    this.voterAddress = this.voterAddress.toLowerCase();
  }
  if (this.txHash) {
    this.txHash = this.txHash.toLowerCase();
  }
  next();
});

// ============================================
// JSON Transformation
// ============================================

/**
 * Transform output when converting to JSON
 */
voteSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

// ============================================
// Export Model
// ============================================

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
