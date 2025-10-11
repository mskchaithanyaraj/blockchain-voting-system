import { useState, useEffect } from "react";
import {
  Trophy,
  Vote,
  Users,
  CheckCircle,
  RefreshCw,
  XCircle,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";
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
        const resultsData = resultsResponse.data.data.results || []; // Access nested results array
        const apiTotalVotes = resultsResponse.data.data.totalVotes || 0;

        // Use API total votes if available (more accurate than election state total)
        if (apiTotalVotes > 0) {
          setTotalVotes(apiTotalVotes);
        }

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
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (electionState !== 2) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundColor: "var(--clr-background-primary)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-lg shadow-md p-8 text-center"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="mb-6">
              <AlertTriangle
                className="mx-auto h-24 w-24"
                style={{
                  color: "var(--clr-warning-primary)",
                }}
              />
            </div>
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                color: "var(--clr-text-primary)",
              }}
            >
              Results Not Available
            </h2>
            <p
              className="mb-6"
              style={{
                color: "var(--clr-text-secondary)",
              }}
            >
              {electionState === 0
                ? "The election has not started yet. Results will be available after the election ends."
                : "The election is currently active. Results will be available after the election ends."}
            </p>
            <button
              onClick={fetchResults}
              className="px-6 py-3 rounded-lg transition duration-200 font-semibold flex items-center mx-auto"
              style={{
                backgroundColor: "var(--clr-primary-a10)",
                color: "var(--clr-text-inverse)",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
              }}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundColor: "var(--clr-background-primary)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: "var(--clr-error-surface)",
              borderColor: "var(--clr-error-border)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle
                  className="h-6 w-6"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                />
              </div>
              <div className="ml-3">
                <h3
                  className="text-lg font-medium"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                >
                  Error
                </h3>
                <p
                  className="mt-2 text-sm"
                  style={{
                    color: "var(--clr-error-text)",
                  }}
                >
                  {error}
                </p>
                <button
                  onClick={fetchResults}
                  className="mt-4 px-4 py-2 rounded transition duration-200"
                  style={{
                    backgroundColor: "var(--clr-error-primary)",
                    color: "var(--clr-text-inverse)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = "1";
                  }}
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
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--clr-background-primary)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Election Results
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>{electionName}</p>
        </div>

        {/* Winner Announcement */}
        {winner && (
          <div
            className="mb-8 rounded-lg shadow-lg p-8 border-2"
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
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle
                    className="w-16 h-16"
                    style={{
                      color: "var(--clr-warning-text)",
                    }}
                  />
                </div>
                <h2
                  className="text-center text-3xl font-bold mb-4"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  DRAW - TIE RESULT
                </h2>
                <p
                  className="text-center text-xl mb-6"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Multiple candidates tied with {winner.voteCount} votes each
                </p>
                <div className="space-y-3 max-w-2xl mx-auto">
                  {winner.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{
                        backgroundColor: "var(--clr-surface-a10)",
                      }}
                    >
                      <div>
                        <p
                          className="text-lg font-semibold"
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
                          className="text-2xl font-bold"
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
                <div className="text-center mt-6">
                  <p
                    className="text-lg"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    <span className="font-bold">{winner.voteCount}</span> votes
                    each
                    <span className="mx-2">•</span>
                    <span className="font-bold">
                      {getVotePercentage(winner.voteCount)}%
                    </span>{" "}
                    of total votes
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{
                      color: "var(--clr-warning-text)",
                    }}
                  >
                    A tiebreaker process may be required according to election
                    rules.
                  </p>
                </div>
              </div>
            ) : (
              // Single winner case
              <div>
                <div className="flex items-center justify-center mb-4">
                  <Trophy
                    className="w-16 h-16"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  />
                </div>
                <h2
                  className="text-center text-3xl font-bold mb-2"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  Winner
                </h2>
                <p
                  className="text-center text-4xl font-extrabold mb-2"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {winner.name}
                </p>
                <p
                  className="text-center text-2xl mb-4"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  {winner.party}
                </p>
                <div className="text-center">
                  <p
                    className="text-xl"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
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
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-text-tertiary)",
                  }}
                >
                  Total Votes
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {totalVotes}
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a30)",
                }}
              >
                <Vote
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-text-tertiary)",
                  }}
                >
                  Total Candidates
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {results.length}
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a30)",
                }}
              >
                <Users
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-text-tertiary)",
                  }}
                >
                  Election Status
                </p>
                <p
                  className="text-xl font-bold"
                  style={{
                    color: "var(--clr-success-primary)",
                  }}
                >
                  Ended
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-success-surface)",
                }}
              >
                <CheckCircle
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-success-primary)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
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
              Detailed Results
            </h2>
            <button
              onClick={fetchResults}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200"
              style={{
                backgroundColor: "var(--clr-surface-a30)",
                color: "var(--clr-text-primary)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--clr-surface-a40)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--clr-surface-a30)";
              }}
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3
                className="mx-auto h-16 w-16 mb-4"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              />
              <p
                className="text-lg"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                No votes were cast
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((candidate, index) => {
                const percentage = getVotePercentage(candidate.voteCount);
                const rank = index + 1;

                // Check if this candidate is a winner (in case of draw, multiple winners)
                const isWinner =
                  winner &&
                  ((winner.isDraw &&
                    winner.candidates.some((c) => c.id === candidate.id)) ||
                    (!winner.isDraw && candidate.id === winner.id));

                return (
                  <div
                    key={candidate.id}
                    className="border-2 rounded-lg p-6 transition duration-200"
                    style={{
                      borderColor: isWinner
                        ? "var(--clr-surface-a40)"
                        : "var(--clr-surface-a20)",
                      backgroundColor: isWinner
                        ? "var(--clr-surface-a20)"
                        : "var(--clr-surface-a10)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isWinner) {
                        e.target.style.borderColor = "var(--clr-surface-a30)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isWinner) {
                        e.target.style.borderColor = "var(--clr-surface-a20)";
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className="text-2xl font-bold"
                          style={{
                            color: isWinner
                              ? "var(--clr-text-primary)"
                              : "var(--clr-text-secondary)",
                          }}
                        >
                          {getRankSuffix(rank)}
                        </div>
                        <div>
                          <h3
                            className="text-xl font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {candidate.name}
                          </h3>
                          <p style={{ color: "var(--clr-text-secondary)" }}>
                            {candidate.party}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-3xl font-bold"
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

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span
                            className="text-xs font-semibold inline-block"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div
                        className="overflow-hidden h-3 mb-4 text-xs flex rounded-full"
                        style={{
                          backgroundColor: "var(--clr-surface-a30)",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: isWinner
                              ? "var(--clr-surface-a50)"
                              : "var(--clr-primary-a10)",
                          }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                        ></div>
                      </div>
                    </div>

                    {isWinner && (
                      <div className="flex items-center justify-center mt-2">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold flex items-center"
                          style={{
                            backgroundColor:
                              winner && winner.isDraw
                                ? "var(--clr-warning-surface)"
                                : "var(--clr-surface-a30)",
                            color:
                              winner && winner.isDraw
                                ? "var(--clr-warning-text)"
                                : "var(--clr-text-primary)",
                          }}
                        >
                          {winner && winner.isDraw ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Tied Winner
                            </>
                          ) : (
                            <>
                              <Trophy className="w-4 h-4 mr-1" />
                              Winner
                            </>
                          )}
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
