import { useState, useEffect } from "react";
import * as apiService from "../services/api.service";

/**
 * View Results Page
 * Displays election results with winner announcement and vote statistics
 */
const ViewResults = () => {
  const [results, setResults] = useState([]);
  const [electionState, setElectionState] = useState(0);
  const [electionName, setElectionName] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch election state
      const stateResponse = await apiService.getElectionState();
      const state = stateResponse.data.data.state;
      setElectionState(state);
      setElectionName(stateResponse.data.data.electionName || "Election");
      setTotalVotes(stateResponse.data.data.totalVotes || 0);

      // Only fetch results if election has ended
      if (state === 2) {
        const resultsResponse = await apiService.getResults();
        const resultsData = resultsResponse.data.data || [];

        // Sort by vote count descending
        const sortedResults = [...resultsData].sort(
          (a, b) => b.voteCount - a.voteCount
        );
        setResults(sortedResults);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const getWinner = () => {
    if (results.length === 0) return null;
    return results[0];
  };

  const getVotePercentage = (voteCount) => {
    if (totalVotes === 0) return 0;
    return ((voteCount / totalVotes) * 100).toFixed(2);
  };

  const getRankSuffix = (rank) => {
    const suffixes = ["st", "nd", "rd"];
    const mod = rank % 10;
    const suffix = mod <= 3 && mod > 0 ? suffixes[mod - 1] : "th";
    return `${rank}${suffix}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (electionState !== 2) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Results Not Available
            </h2>
            <p className="text-gray-600 mb-6">
              {electionState === 0
                ? "The election has not started yet. Results will be available after the election ends."
                : "The election is currently active. Results will be available after the election ends."}
            </p>
            <button
              onClick={fetchResults}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-400"
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
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchResults}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const winner = getWinner();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Election Results
          </h1>
          <p className="text-gray-600">{electionName}</p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div className="mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-bold mb-2">
              🏆 Winner 🏆
            </h2>
            <p className="text-center text-4xl font-extrabold mb-2">
              {winner.name}
            </p>
            <p className="text-center text-2xl mb-4">{winner.party}</p>
            <div className="text-center">
              <p className="text-xl">
                <span className="font-bold">{winner.voteCount}</span> votes
                <span className="mx-2">•</span>
                <span className="font-bold">
                  {getVotePercentage(winner.voteCount)}%
                </span>{" "}
                of total votes
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{totalVotes}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {results.length}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Election Status</p>
                <p className="text-xl font-bold text-green-600">Ended</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Detailed Results
            </h2>
            <button
              onClick={fetchResults}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-600 text-lg">No votes were cast</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((candidate, index) => {
                const percentage = getVotePercentage(candidate.voteCount);
                const rank = index + 1;
                const isWinner = rank === 1;

                return (
                  <div
                    key={candidate.id}
                    className={`border-2 rounded-lg p-6 transition duration-200 ${
                      isWinner
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`text-2xl font-bold ${
                            isWinner ? "text-yellow-600" : "text-gray-600"
                          }`}
                        >
                          {getRankSuffix(rank)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {candidate.name}
                          </h3>
                          <p className="text-gray-600">{candidate.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {candidate.voteCount}
                        </p>
                        <p className="text-sm text-gray-500">votes</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-600">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                            isWinner
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-r from-blue-400 to-blue-600"
                          }`}
                        ></div>
                      </div>
                    </div>

                    {isWinner && (
                      <div className="flex items-center justify-center mt-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                          🏆 Winner
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewResults;
