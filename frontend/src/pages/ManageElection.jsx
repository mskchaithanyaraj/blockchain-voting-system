import { useState, useEffect } from "react";
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

      const stateResponse = await apiService.getElectionState();
      const stateData = stateResponse.data.data;
      setElectionState(stateData);

      // If election has ended, fetch results
      if (stateData.state === 2) {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  const winner = electionState.state === 2 ? getWinner() : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Manage Election
          </h1>
          <p className="text-gray-600">
            Control election state and view results
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Election State Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Current Election Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Election Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {electionState.electionName || "General Election 2025"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <span
                className={`${getStateColor(
                  electionState.state
                )} text-white px-4 py-2 rounded-full text-sm font-semibold inline-block`}
              >
                {getElectionStateText(electionState.state)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {electionState.totalCandidates}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Registered Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {electionState.totalVoters || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Votes Cast</p>
              <p className="text-2xl font-bold text-gray-900">
                {electionState.totalVotes}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Voter Turnout</p>
              <p className="text-2xl font-bold text-gray-900">
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Election Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowConfirmModal("start")}
              disabled={electionState.state !== 0}
              className={`py-4 px-6 rounded-lg font-semibold transition duration-200 ${
                electionState.state === 0
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
              className={`py-4 px-6 rounded-lg font-semibold transition duration-200 ${
                electionState.state === 1
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
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

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Election Results
            </h2>

            {winner && (
              <div className="mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold mb-2">🏆 WINNER</p>
                    <h3 className="text-3xl font-bold">{winner.name}</h3>
                    <p className="text-lg">{winner.party}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{winner.voteCount}</p>
                    <p className="text-sm">votes</p>
                  </div>
                </div>
              </div>
            )}

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {candidate.name}
                          </h4>
                          <p className="text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {candidate.voteCount}
                        </p>
                        <p className="text-sm text-gray-500">votes</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{
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
                    <p className="text-right text-sm text-gray-500 mt-1">
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
                <p className="text-gray-600">No results available yet</p>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {showConfirmModal === "start"
                  ? "Start Election?"
                  : "End Election?"}
              </h3>
              <p className="text-gray-600 mb-6">
                {showConfirmModal === "start"
                  ? "Are you sure you want to start the election? Make sure all candidates and voters are registered."
                  : "Are you sure you want to end the election? This action cannot be undone and results will be finalized."}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(null)}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-semibold"
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
                  className={`flex-1 py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                    actionLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : showConfirmModal === "start"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
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
