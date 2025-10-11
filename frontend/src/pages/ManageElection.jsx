import { useState, useEffect } from "react";
import {
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Trophy,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Manage Election Page
 * Start/end election, view election state, and display results
 */
const ManageElection = () => {
  const [electionState, setElectionState] = useState({
    state: 0,
    electionName: "",
    totalCandidates: 0,
    totalVotes: 0,
    totalVoters: 0,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'start' or 'end'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchElectionData();
  }, []);

  const fetchElectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use admin election stats endpoint
      const statsResponse = await apiService.getElectionStats();
      const statsData = statsResponse.data.data;

      // Also fetch candidates to get accurate count
      const candidatesResponse = await apiService.getAllCandidatesAdmin();
      const candidates = candidatesResponse.data.data;

      setElectionState({
        state: statsData.stateNumber,
        electionName: statsData.name,
        totalCandidates: candidates.length,
        totalVotes: statsData.totalVotes,
        totalVoters: statsData.registeredVoterCount,
      });

      // If election has ended, fetch results
      if (statsData.stateNumber === 2) {
        try {
          const resultsResponse = await apiService.getResultsAdmin();
          setResults(resultsResponse.data.data || []);
        } catch (err) {
          console.error("Error fetching results:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching election data:", err);
      setError(err.message || "Failed to fetch election data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartElection = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await apiService.startElection();

      setSuccess("Election started successfully!");
      setShowConfirmModal(null);
      await fetchElectionData();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error starting election:", err);
      setError(err.message || "Failed to start election");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndElection = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      await apiService.endElection();

      setSuccess("Election ended successfully!");
      setShowConfirmModal(null);
      await fetchElectionData();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error ending election:", err);
      setError(err.message || "Failed to end election");
    } finally {
      setActionLoading(false);
    }
  };

  const getElectionStateText = (state) => {
    const states = {
      0: "Not Started",
      1: "Active",
      2: "Ended",
    };
    return states[state] || "Unknown";
  };

  const getStateColor = (state) => {
    const colors = {
      0: "bg-gray-500",
      1: "bg-green-500",
      2: "bg-red-500",
    };
    return colors[state] || "bg-gray-500";
  };

  const getWinner = () => {
    if (results.length === 0) return null;
    return results.reduce((max, candidate) =>
      candidate.voteCount > max.voteCount ? candidate : max
    );
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: "var(--clr-background-primary)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
            style={{
              border: "4px solid var(--clr-surface-primary)",
              borderTop: "4px solid var(--clr-text-primary)",
            }}
          ></div>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Loading election data...
          </p>
        </div>
      </div>
    );
  }

  const winner = electionState.state === 2 ? getWinner() : null;

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--clr-background-primary)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Manage Election
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Control election state and view results
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 rounded-lg p-4 border"
            style={{
              backgroundColor: "var(--clr-error-surface)",
              borderColor: "var(--clr-error-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle
                  className="h-5 w-5"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                >
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="mb-6 rounded-lg p-4 border"
            style={{
              backgroundColor: "var(--clr-success-surface)",
              borderColor: "var(--clr-success-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle
                  className="h-5 w-5"
                  style={{
                    color: "var(--clr-success-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-success-text)",
                  }}
                >
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Election State Card */}
        <div
          className="rounded-lg shadow-md p-6 mb-8"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Current Election Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Election Name
              </p>
              <p
                className="text-lg font-semibold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {electionState.electionName || "General Election 2025"}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Status
              </p>
              <span
                className={`${getStateColor(
                  electionState.state
                )} text-white px-4 py-2 rounded-full text-sm font-semibold inline-block`}
              >
                {getElectionStateText(electionState.state)}
              </span>
            </div>
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Total Candidates
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {electionState.totalCandidates}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Registered Voters
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {electionState.totalVoters || 0}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Votes Cast
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {electionState.totalVotes}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Voter Turnout
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {electionState.totalVoters > 0
                  ? Math.round(
                      (electionState.totalVotes / electionState.totalVoters) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Election Controls */}
        <div
          className="rounded-lg shadow-md p-6 mb-8"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Election Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowConfirmModal("start")}
              disabled={electionState.state !== 0}
              className="py-4 px-6 rounded-lg font-semibold transition duration-200 flex flex-col items-center justify-center"
              style={{
                backgroundColor:
                  electionState.state === 0
                    ? "var(--clr-success-primary)"
                    : "var(--clr-surface-a40)",
                color:
                  electionState.state === 0
                    ? "var(--clr-text-inverse)"
                    : "var(--clr-text-tertiary)",
                cursor: electionState.state === 0 ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (electionState.state === 0) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (electionState.state === 0) {
                  e.target.style.opacity = "1";
                }
              }}
            >
              <div className="flex items-center justify-center">
                <Play className="w-6 h-6 mr-2" />
                Start Election
              </div>
              {electionState.state !== 0 && (
                <p className="text-xs mt-2">
                  Election has already been started
                </p>
              )}
            </button>

            <button
              onClick={() => setShowConfirmModal("end")}
              disabled={electionState.state !== 1}
              className="py-4 px-6 rounded-lg font-semibold transition duration-200 flex flex-col items-center justify-center"
              style={{
                backgroundColor:
                  electionState.state === 1
                    ? "var(--clr-danger-primary)"
                    : "var(--clr-surface-a40)",
                color:
                  electionState.state === 1
                    ? "var(--clr-text-inverse)"
                    : "var(--clr-text-tertiary)",
                cursor: electionState.state === 1 ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (electionState.state === 1) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (electionState.state === 1) {
                  e.target.style.opacity = "1";
                }
              }}
            >
              <div className="flex items-center justify-center">
                <Square className="w-6 h-6 mr-2" />
                End Election
              </div>
              {electionState.state === 0 && (
                <p className="text-xs mt-2">Start election first</p>
              )}
              {electionState.state === 2 && (
                <p className="text-xs mt-2">Election has already ended</p>
              )}
            </button>
          </div>

          <div
            className="mt-6 rounded-lg p-4 border"
            style={{
              backgroundColor: "var(--clr-warning-surface)",
              borderColor: "var(--clr-warning-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle
                  className="h-5 w-5"
                  style={{
                    color: "var(--clr-warning-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-warning-text)",
                  }}
                >
                  <strong>Warning:</strong> These actions are permanent and
                  cannot be undone. Ensure all candidates and voters are
                  registered before starting the election.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section (Only shown if election has ended) */}
        {electionState.state === 2 && (
          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{
                color: "var(--clr-text-primary)",
              }}
            >
              Election Results
            </h2>

            {winner && (
              <div
                className="mb-6 rounded-lg p-6 border-2"
                style={{
                  backgroundColor: "var(--clr-surface-a20)",
                  borderColor: "var(--clr-surface-a40)",
                  background:
                    "linear-gradient(135deg, var(--clr-surface-a20) 0%, var(--clr-surface-a30) 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <Trophy
                        className="w-6 h-6 mr-2"
                        style={{
                          color: "var(--clr-text-primary)",
                        }}
                      />
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--clr-text-primary)",
                        }}
                      >
                        WINNER
                      </p>
                    </div>
                    <h3
                      className="text-3xl font-bold"
                      style={{
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      {winner.name}
                    </h3>
                    <p
                      className="text-lg"
                      style={{
                        color: "var(--clr-text-secondary)",
                      }}
                    >
                      {winner.party}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-4xl font-bold"
                      style={{
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      {winner.voteCount}
                    </p>
                    <p
                      className="text-sm"
                      style={{
                        color: "var(--clr-text-secondary)",
                      }}
                    >
                      votes
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="rounded-lg p-4 hover:shadow-md transition duration-200 border"
                    style={{
                      backgroundColor: "var(--clr-surface-a10)",
                      borderColor: "var(--clr-surface-a20)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "var(--clr-surface-a30)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "var(--clr-surface-a20)";
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <span
                          className="text-2xl font-bold"
                          style={{
                            color: "var(--clr-text-tertiary)",
                          }}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <h4
                            className="text-lg font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {candidate.name}
                          </h4>
                          <p style={{ color: "var(--clr-text-secondary)" }}>
                            {candidate.party}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-2xl font-bold"
                          style={{
                            color: "var(--clr-text-primary)",
                          }}
                        >
                          {candidate.voteCount}
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: "var(--clr-text-tertiary)",
                          }}
                        >
                          votes
                        </p>
                      </div>
                    </div>
                    <div
                      className="w-full rounded-full h-3"
                      style={{
                        backgroundColor: "var(--clr-surface-a30)",
                      }}
                    >
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: "var(--clr-primary-a10)",
                          width: `${
                            electionState.totalVotes > 0
                              ? (candidate.voteCount /
                                  electionState.totalVotes) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <p
                      className="text-right text-sm mt-1"
                      style={{
                        color: "var(--clr-text-tertiary)",
                      }}
                    >
                      {electionState.totalVotes > 0
                        ? (
                            (candidate.voteCount / electionState.totalVotes) *
                            100
                          ).toFixed(2)
                        : 0}
                      %
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p style={{ color: "var(--clr-text-secondary)" }}>
                  No results available yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
              style={{
                backgroundColor: "var(--clr-surface-secondary)",
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {showConfirmModal === "start"
                  ? "Start Election?"
                  : "End Election?"}
              </h3>
              <p
                className="mb-6"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                {showConfirmModal === "start"
                  ? "Are you sure you want to start the election? Make sure all candidates and voters are registered."
                  : "Are you sure you want to end the election? This action cannot be undone and results will be finalized."}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg transition duration-200 font-semibold"
                  style={{
                    backgroundColor: "var(--clr-surface-a40)",
                    color: "var(--clr-text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.target.style.backgroundColor = "var(--clr-surface-a50)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading) {
                      e.target.style.backgroundColor = "var(--clr-surface-a40)";
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showConfirmModal === "start"
                      ? handleStartElection
                      : handleEndElection
                  }
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold transition duration-200"
                  style={{
                    backgroundColor: actionLoading
                      ? "var(--clr-surface-a40)"
                      : showConfirmModal === "start"
                      ? "var(--clr-success-primary)"
                      : "var(--clr-danger-primary)",
                    color: "var(--clr-text-inverse)",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.target.style.opacity = "0.9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading) {
                      e.target.style.opacity = "1";
                    }
                  }}
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </span>
                  ) : showConfirmModal === "start" ? (
                    "Yes, Start"
                  ) : (
                    "Yes, End"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageElection;
