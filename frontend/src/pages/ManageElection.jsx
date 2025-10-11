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
  Archive,
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
  const [showConfirmModal, setShowConfirmModal] = useState(null); // 'start', 'end', or 'reset'
  const [actionLoading, setActionLoading] = useState(false);
  const [electionName, setElectionName] = useState(""); // For new election name input

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

      // Validate prerequisites before starting election
      if (electionState.totalCandidates === 0) {
        setError(
          "Cannot start election: No candidates have been added. Please add at least one candidate before starting the election."
        );
        setActionLoading(false);
        return;
      }

      if (electionState.totalVoters === 0) {
        setError(
          "Cannot start election: No voters have been registered. Please register at least one voter before starting the election."
        );
        setActionLoading(false);
        return;
      }

      const electionData = {
        electionName: electionName.trim() || "General Election 2025",
      };
      await apiService.startElection(electionData);

      setSuccess("Election started successfully!");
      setShowConfirmModal(null);
      setElectionName(""); // Reset input
      await fetchElectionData();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error starting election:", err);

      // Provide more specific error messages
      let errorMessage = "Failed to start election";
      if (err.message) {
        if (err.message.includes("Cannot start election without candidates")) {
          errorMessage =
            "Cannot start election: No candidates have been added. Please add candidates first.";
        } else if (
          err.message.includes(
            "Cannot start election without registered voters"
          )
        ) {
          errorMessage =
            "Cannot start election: No voters have been registered. Please register voters first.";
        } else if (err.message.includes("Only admin can perform this action")) {
          errorMessage =
            "Access denied: Only the admin can start the election.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndElection = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiService.endElection();

      // Show success message based on response
      const data = response.data;
      let successMessage = data.message || "Election ended successfully!";

      // Add additional info if archived
      if (data.data?.archived && data.data?.electionNumber) {
        successMessage += ` You can view the archived results in the Election History.`;
      }

      if (data.warning) {
        console.warn("Archive warning:", data.warning);
        successMessage += ` (Warning: ${data.warning})`;
      }

      setSuccess(successMessage);
      setShowConfirmModal(null);
      await fetchElectionData();

      setTimeout(() => setSuccess(null), 8000); // Longer timeout for archive message
    } catch (err) {
      console.error("Error ending election:", err);
      setError(err.message || "Failed to end election");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetElection = async () => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const electionData = {
        electionName: electionName.trim() || "New Election 2025",
      };
      const response = await apiService.resetElection(electionData);

      // Use the message from the backend response
      const data = response.data;
      let successMessage =
        data.message ||
        "Election reset successfully! You can now add new candidates and voters.";

      setSuccess(successMessage);
      setShowConfirmModal(null);
      setElectionName(""); // Reset input
      await fetchElectionData();

      setTimeout(() => setSuccess(null), 8000); // Longer timeout for archive message
    } catch (err) {
      console.error("Error resetting election:", err);
      setError(err.message || "Failed to reset election");
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

    // Find the highest vote count
    const maxVotes = Math.max(
      ...results.map((candidate) => candidate.voteCount)
    );

    // Find all candidates with the highest vote count
    const winnersWithMaxVotes = results.filter(
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

          {/* Election Readiness Status - Only show when election not started */}
          {electionState.state === 0 && (
            <div
              className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor:
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                    ? "var(--clr-success-surface)"
                    : "var(--clr-warning-surface)",
                borderColor:
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                    ? "var(--clr-success-border)"
                    : "var(--clr-warning-border)",
              }}
            >
              <h3
                className="font-semibold mb-3"
                style={{
                  color:
                    electionState.totalCandidates > 0 &&
                    electionState.totalVoters > 0
                      ? "var(--clr-success-text)"
                      : "var(--clr-warning-text)",
                }}
              >
                Election Readiness Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  {electionState.totalCandidates > 0 ? (
                    <CheckCircle
                      className="w-5 h-5 mr-2"
                      style={{ color: "var(--clr-success-text)" }}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 mr-2"
                      style={{ color: "var(--clr-danger-text)" }}
                    />
                  )}
                  <span
                    style={{
                      color:
                        electionState.totalCandidates > 0
                          ? "var(--clr-success-text)"
                          : "var(--clr-danger-text)",
                    }}
                  >
                    {electionState.totalCandidates > 0
                      ? `${electionState.totalCandidates} candidate(s) added`
                      : "No candidates added - Please add at least one candidate"}
                  </span>
                </div>
                <div className="flex items-center">
                  {electionState.totalVoters > 0 ? (
                    <CheckCircle
                      className="w-5 h-5 mr-2"
                      style={{ color: "var(--clr-success-text)" }}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 mr-2"
                      style={{ color: "var(--clr-danger-text)" }}
                    />
                  )}
                  <span
                    style={{
                      color:
                        electionState.totalVoters > 0
                          ? "var(--clr-success-text)"
                          : "var(--clr-danger-text)",
                    }}
                  >
                    {electionState.totalVoters > 0
                      ? `${electionState.totalVoters} voter(s) registered`
                      : "No voters registered - Please register at least one voter"}
                  </span>
                </div>
              </div>
              {(electionState.totalCandidates === 0 ||
                electionState.totalVoters === 0) && (
                <p
                  className="text-sm mt-3"
                  style={{ color: "var(--clr-warning-text)" }}
                >
                  <strong>Warning:</strong> You must add candidates and register
                  voters before starting the election.
                </p>
              )}
            </div>
          )}

          {/* Election Name Input (only show when not started or when ended for reset) */}
          {(electionState.state === 0 || electionState.state === 2) && (
            <div className="mb-6">
              <label
                htmlFor="electionName"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                {electionState.state === 0
                  ? "Election Name"
                  : "New Election Name"}
              </label>
              <input
                id="electionName"
                type="text"
                value={electionName}
                onChange={(e) => setElectionName(e.target.value)}
                placeholder={
                  electionState.state === 0
                    ? "Enter election name (e.g., Presidential Election 2025)"
                    : "Enter new election name"
                }
                className="w-full px-4 py-3 rounded-lg border transition duration-200"
                style={{
                  backgroundColor: "var(--clr-surface-primary)",
                  borderColor: "var(--clr-surface-a40)",
                  color: "var(--clr-text-primary)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--clr-primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--clr-surface-a40)";
                }}
              />
            </div>
          )}

          <div
            className={`grid grid-cols-1 ${
              electionState.state === 2 ? "md:grid-cols-3" : "md:grid-cols-2"
            } gap-4`}
          >
            <button
              onClick={() => setShowConfirmModal("start")}
              disabled={
                electionState.state !== 0 ||
                electionState.totalCandidates === 0 ||
                electionState.totalVoters === 0
              }
              className="py-4 px-6 rounded-lg font-semibold transition duration-200 flex flex-col items-center justify-center"
              style={{
                backgroundColor:
                  electionState.state === 0 &&
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                    ? "var(--clr-success-primary)"
                    : "var(--clr-surface-a40)",
                color:
                  electionState.state === 0 &&
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                    ? "var(--clr-text-inverse)"
                    : "var(--clr-text-tertiary)",
                cursor:
                  electionState.state === 0 &&
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                    ? "pointer"
                    : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (
                  electionState.state === 0 &&
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                ) {
                  e.target.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (
                  electionState.state === 0 &&
                  electionState.totalCandidates > 0 &&
                  electionState.totalVoters > 0
                ) {
                  e.target.style.opacity = "1";
                }
              }}
            >
              <div className="flex items-center justify-center">
                <Play className="w-6 h-6 mr-2" />
                Start Election
              </div>
              {electionState.state !== 0 ? (
                <p className="text-xs mt-2">
                  Election has already been started
                </p>
              ) : electionState.totalCandidates === 0 ||
                electionState.totalVoters === 0 ? (
                <p className="text-xs mt-2">
                  {electionState.totalCandidates === 0
                    ? "Add candidates first"
                    : "Register voters first"}
                </p>
              ) : null}
            </button>

            <button
              onClick={() => setShowConfirmModal("end")}
              disabled={electionState.state !== 1}
              className="py-4 px-6 rounded-lg font-semibold transition duration-200 flex flex-col items-center justify-center border-2"
              style={{
                backgroundColor:
                  electionState.state === 1
                    ? "#dc2626" // Red color for end election
                    : "var(--clr-surface-a40)",
                borderColor:
                  electionState.state === 1
                    ? "#dc2626"
                    : "var(--clr-surface-a40)",
                color:
                  electionState.state === 1
                    ? "white"
                    : "var(--clr-text-tertiary)",
                cursor: electionState.state === 1 ? "pointer" : "not-allowed",
                minHeight: "100px", // Increased minimum height for better visibility
                minWidth: "220px", // Increased minimum width for better visibility
                fontWeight: "bold", // Make text more prominent
                fontSize: "16px", // Ensure readable font size
                boxShadow:
                  electionState.state === 1
                    ? "0 4px 12px rgba(220, 38, 38, 0.3)"
                    : "none", // Add shadow when active
              }}
              onMouseEnter={(e) => {
                if (electionState.state === 1) {
                  e.target.style.opacity = "0.9";
                  e.target.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (electionState.state === 1) {
                  e.target.style.opacity = "1";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              <div className="flex items-center justify-center mb-2">
                <Square className="w-7 h-7 mr-2" style={{ strokeWidth: 2.5 }} />
                <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                  End Election
                </span>
              </div>
              {electionState.state === 0 && (
                <p className="text-xs mt-1" style={{ opacity: 0.8 }}>
                  Start election first
                </p>
              )}
              {electionState.state === 2 && (
                <p className="text-xs mt-1" style={{ opacity: 0.8 }}>
                  Election has already ended
                </p>
              )}
              {electionState.state === 1 && (
                <p
                  className="text-xs mt-1"
                  style={{ opacity: 0.9, color: "rgba(255, 255, 255, 0.9)" }}
                >
                  Click to end voting
                </p>
              )}
            </button>

            {/* Reset Election Button (only show when election has ended) */}
            {electionState.state === 2 && (
              <button
                onClick={() => setShowConfirmModal("reset")}
                className="py-4 px-6 rounded-lg font-semibold transition duration-200 flex flex-col items-center justify-center border"
                style={{
                  backgroundColor: "#374151", // bg-gray-700 equivalent
                  borderColor: "#4B5563", // border-gray-600 equivalent
                  color: "#E5E7EB", // text-gray-200 equivalent
                  cursor: "pointer",
                  minHeight: "100px",
                  minWidth: "200px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#4B5563"; // hover:bg-gray-600 equivalent
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#374151"; // back to bg-gray-700
                  e.target.style.transform = "translateY(0)";
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  <RefreshCw className="w-6 h-6 mr-2" />
                  <span style={{ fontSize: "16px", fontWeight: "600" }}>
                    New Election
                  </span>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ opacity: 0.8, color: "#D1D5DB" }} // text-gray-300 equivalent
                >
                  Start fresh election
                </p>
              </button>
            )}
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
                  cannot be undone.
                  {electionState.state === 0 &&
                    " Ensure all candidates and voters are registered before starting the election."}
                  {electionState.state === 1 &&
                    " Ending the election will finalize all votes and display the results."}
                  {electionState.state === 2 &&
                    " Resetting will clear all data and allow you to start a new election."}
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
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                Election Results
              </h2>

              {/* Archive Status Indicator */}
              <div
                className="flex items-center px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: "var(--clr-success-surface)",
                  color: "var(--clr-success-text)",
                  border: "1px solid var(--clr-success-border)",
                }}
              >
                <Archive className="w-4 h-4 mr-2" />
                <span>Automatically Archived</span>
              </div>
            </div>

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
                {winner.isDraw ? (
                  // Draw case
                  <div>
                    <div className="flex items-center mb-4">
                      <AlertTriangle
                        className="w-6 h-6 mr-2"
                        style={{
                          color: "var(--clr-warning-text)",
                        }}
                      />
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--clr-warning-text)",
                        }}
                      >
                        DRAW - TIE RESULT
                      </p>
                    </div>
                    <h3
                      className="text-2xl font-bold mb-4"
                      style={{
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      Multiple candidates tied with {winner.voteCount} votes
                      each
                    </h3>
                    <div className="space-y-3">
                      {winner.candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            backgroundColor: "var(--clr-surface-a10)",
                          }}
                        >
                          <div>
                            <p
                              className="font-semibold"
                              style={{
                                color: "var(--clr-text-primary)",
                              }}
                            >
                              {candidate.name}
                            </p>
                            <p
                              className="text-sm"
                              style={{
                                color: "var(--clr-text-secondary)",
                              }}
                            >
                              {candidate.party}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className="text-xl font-bold"
                              style={{
                                color: "var(--clr-text-primary)",
                              }}
                            >
                              {candidate.voteCount}
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "var(--clr-text-secondary)",
                              }}
                            >
                              votes
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p
                      className="text-sm mt-4 text-center"
                      style={{
                        color: "var(--clr-warning-text)",
                      }}
                    >
                      A tiebreaker process may be required according to election
                      rules.
                    </p>
                  </div>
                ) : (
                  // Single winner case
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Trophy
                          className="w-6 h-6 mr-2"
                          style={{
                            color: "var(--clr-success-text)",
                          }}
                        />
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: "var(--clr-success-text)",
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
                )}
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

            {/* Archive Information */}
            <div
              className="mt-6 p-4 rounded-lg border"
              style={{
                backgroundColor: "var(--clr-surface-a10)",
                borderColor: "var(--clr-surface-a20)",
              }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Archive
                    className="h-5 w-5 mt-0.5"
                    style={{
                      color: "var(--clr-text-secondary)",
                    }}
                  />
                </div>
                <div className="ml-3">
                  <p
                    className="text-sm font-medium mb-1"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    Election Archived
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--clr-text-secondary)",
                    }}
                  >
                    This election has been automatically archived to preserve
                    historical data. You can view all past elections and their
                    complete results in the{" "}
                    <a
                      href="/admin/history"
                      className="underline hover:no-underline"
                      style={{
                        color: "var(--clr-primary)",
                      }}
                    >
                      Election History
                    </a>{" "}
                    section. To start a new election, use the "New Election"
                    button above.
                  </p>
                </div>
              </div>
            </div>
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
                  : showConfirmModal === "end"
                  ? "End Election?"
                  : "Reset Election?"}
              </h3>
              <p
                className="mb-6"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                {showConfirmModal === "start"
                  ? `Are you sure you want to start the election "${
                      electionName.trim() || "General Election 2025"
                    }"? Make sure all candidates and voters are registered.`
                  : showConfirmModal === "end"
                  ? "Are you sure you want to end the election? This action cannot be undone and results will be finalized."
                  : `Are you sure you want to reset the election? This will archive the current election data and clear all candidates, voters, and votes to start fresh. The new election will be named "${
                      electionName.trim() || "New Election 2025"
                    }". Previous election data will be preserved in the election history.`}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg transition duration-200 font-semibold border-2"
                  style={{
                    backgroundColor: "var(--clr-surface-secondary)",
                    color: "var(--clr-text-primary)",
                    borderColor: "var(--clr-surface-a40)",
                    minHeight: "50px",
                    fontSize: "16px",
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.target.style.backgroundColor = "var(--clr-surface-a20)";
                      e.target.style.borderColor = "var(--clr-surface-a50)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading) {
                      e.target.style.backgroundColor =
                        "var(--clr-surface-secondary)";
                      e.target.style.borderColor = "var(--clr-surface-a40)";
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showConfirmModal === "start"
                      ? handleStartElection
                      : showConfirmModal === "end"
                      ? handleEndElection
                      : handleResetElection
                  }
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold transition duration-200 border-2"
                  style={{
                    backgroundColor: actionLoading
                      ? "var(--clr-surface-a40)"
                      : showConfirmModal === "start"
                      ? "var(--clr-success-primary)"
                      : showConfirmModal === "end"
                      ? "#dc2626"
                      : "var(--clr-primary)",
                    borderColor: actionLoading
                      ? "var(--clr-surface-a40)"
                      : showConfirmModal === "start"
                      ? "var(--clr-success-primary)"
                      : showConfirmModal === "end"
                      ? "#dc2626"
                      : "var(--clr-primary)",
                    color: "white",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                    minHeight: "50px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    boxShadow:
                      showConfirmModal === "end"
                        ? "0 4px 12px rgba(220, 38, 38, 0.3)"
                        : "0 4px 12px rgba(59, 130, 246, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading) {
                      e.target.style.opacity = "0.9";
                      e.target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading) {
                      e.target.style.opacity = "1";
                      e.target.style.transform = "translateY(0)";
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
                  ) : showConfirmModal === "end" ? (
                    "Yes, End"
                  ) : (
                    "Yes, Reset"
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
