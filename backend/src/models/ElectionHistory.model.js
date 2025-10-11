const mongoose = require("mongoose");

/**
 * Election History Model
 * Stores historical election data when elections are reset
 */
const electionHistorySchema = new mongoose.Schema(
  {
    // Election metadata
    electionName: {
      type: String,
      required: true,
      trim: true,
    },
    electionNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    // Election timeline
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },

    // Election statistics
    totalVotes: {
      type: Number,
      default: 0,
    },
    totalCandidates: {
      type: Number,
      default: 0,
    },
    totalRegisteredVoters: {
      type: Number,
      default: 0,
    },
    voterTurnout: {
      type: Number, // Percentage
      default: 0,
    },

    // Election results
    candidates: [
      {
        id: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        party: {
          type: String,
          required: true,
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Winner information
    winner: {
      isDraw: {
        type: Boolean,
        default: false,
      },
      candidates: [
        {
          id: Number,
          name: String,
          party: String,
          voteCount: Number,
        },
      ],
      voteCount: {
        type: Number,
        default: 0,
      },
    },

    // Blockchain data
    blockchainData: {
      startTransactionHash: String,
      endTransactionHash: String,
      resetTransactionHash: String,
      startBlockNumber: Number,
      endBlockNumber: Number,
      resetBlockNumber: Number,
    },

    // Archive metadata
    archivedAt: {
      type: Date,
      default: Date.now,
    },
    archivedBy: {
      type: String, // Admin address who archived
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "electionhistory",
  }
);

// Indexes for better performance
electionHistorySchema.index({ electionName: 1 });
electionHistorySchema.index({ archivedAt: -1 });

// Virtual for election duration
electionHistorySchema.virtual("electionDuration").get(function () {
  if (this.startTime && this.endTime) {
    return Math.floor((this.endTime - this.startTime) / (1000 * 60 * 60 * 24)); // Days
  }
  return 0;
});

// Method to determine winner
electionHistorySchema.methods.determineWinner = function () {
  if (this.candidates.length === 0) return null;

  // Find the highest vote count
  const maxVotes = Math.max(
    ...this.candidates.map((candidate) => candidate.voteCount)
  );

  // Find all candidates with the highest vote count
  const winnersWithMaxVotes = this.candidates.filter(
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

  // If there's a clear winner or no votes at all
  return winnersWithMaxVotes.length > 0 ? winnersWithMaxVotes[0] : null;
};

// Static method to get latest election number
electionHistorySchema.statics.getNextElectionNumber = async function () {
  const lastElection = await this.findOne(
    {},
    {},
    { sort: { electionNumber: -1 } }
  );
  return lastElection ? lastElection.electionNumber + 1 : 1;
};

// Static method to get election statistics
electionHistorySchema.statics.getElectionStats = async function () {
  const totalElections = await this.countDocuments();
  const totalVotesEver = await this.aggregate([
    { $group: { _id: null, total: { $sum: "$totalVotes" } } },
  ]);

  return {
    totalElections,
    totalVotesEver: totalVotesEver.length > 0 ? totalVotesEver[0].total : 0,
  };
};

const ElectionHistory = mongoose.model(
  "ElectionHistory",
  electionHistorySchema
);

module.exports = ElectionHistory;
