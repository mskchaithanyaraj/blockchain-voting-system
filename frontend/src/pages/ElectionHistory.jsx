import { useState, useEffect, useCallback } from "react";
import {
  History,
  Trophy,
  Users,
  Vote,
  Calendar,
  ChevronRight,
  AlertTriangle,
  Archive,
  RefreshCw,
  Eye,
  Trash2,
  Loader2,
  BarChart3,
  Clock,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Election History Page
 * Displays all past elections with their results and statistics
 */
const ElectionHistory = () => {
  const [elections, setElections] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const fetchElectionHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getElectionHistory({
        page: currentPage,
        limit,
        sort: "-electionNumber",
      });

      const data = response.data.data;
      setElections(data.elections || []);
      setStatistics(data.statistics || {});
      setPagination(data.pagination || {});
    } catch (err) {
      console.error("Error fetching election history:", err);
      setError(err.message || "Failed to fetch election history");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchElectionHistory();
  }, [fetchElectionHistory]);

  const viewElectionDetails = async (electionNumber) => {
    try {
      setActionLoading(true);
      const response = await apiService.getElectionById(electionNumber);
      setSelectedElection(response.data.data);
    } catch (err) {
      console.error("Error fetching election details:", err);
      setError(err.message || "Failed to fetch election details");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteElection = async (electionNumber) => {
    try {
      setActionLoading(true);
      await apiService.deleteElectionHistory(electionNumber);
      setShowDeleteModal(null);
      await fetchElectionHistory(); // Refresh list
    } catch (err) {
      console.error("Error deleting election:", err);
      setError(err.message || "Failed to delete election");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getElectionDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffHours = Math.floor((end - start) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ${diffHours % 24}h`;
    }
    return `${diffHours}h`;
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
            Loading election history...
          </p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center mb-4">
            <History
              className="w-8 h-8 mr-3"
              style={{ color: "var(--clr-primary)" }}
            />
            <h1
              className="text-4xl font-bold"
              style={{
                color: "var(--clr-text-primary)",
              }}
            >
              Election History
            </h1>
          </div>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            View all past elections, results, and historical data
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
                <AlertTriangle
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

        {/* Statistics Cards */}
        {statistics && Object.keys(statistics).length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    Total Elections Held
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    {statistics.totalElections || 0}
                  </p>
                </div>
                <div
                  className="rounded-full p-3"
                  style={{
                    backgroundColor: "var(--clr-surface-a30)",
                  }}
                >
                  <Archive
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
                    Total Votes Cast
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    {statistics.totalVotesEver || 0}
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
                    Average Turnout
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    {elections.length > 0
                      ? Math.round(
                          elections.reduce(
                            (sum, e) => sum + e.voterTurnout,
                            0
                          ) / elections.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div
                  className="rounded-full p-3"
                  style={{
                    backgroundColor: "var(--clr-surface-a30)",
                  }}
                >
                  <BarChart3
                    className="w-8 h-8"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elections List */}
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
              Past Elections
            </h2>
            <button
              onClick={fetchElectionHistory}
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

          {elections.length === 0 ? (
            <div className="text-center py-12">
              <Archive
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
                No election history found
              </p>
              <p
                className="text-sm mt-2"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              >
                Elections will appear here after they are completed and archived
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => (
                <div
                  key={election.electionNumber}
                  className="border rounded-lg p-6 transition duration-200 hover:shadow-md"
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div
                          className="text-2xl font-bold px-3 py-1 rounded-lg"
                          style={{
                            backgroundColor: "var(--clr-primary-a10)",
                            color: "var(--clr-text-inverse)",
                          }}
                        >
                          #{election.electionNumber}
                        </div>
                        <div>
                          <h3
                            className="text-xl font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {election.electionName}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span
                                className="text-sm"
                                style={{
                                  color: "var(--clr-text-secondary)",
                                }}
                              >
                                {formatDate(election.startTime)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span
                                className="text-sm"
                                style={{
                                  color: "var(--clr-text-secondary)",
                                }}
                              >
                                {getElectionDuration(
                                  election.startTime,
                                  election.endTime
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Election Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--clr-text-tertiary)",
                            }}
                          >
                            Total Votes
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {election.totalVotes}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--clr-text-tertiary)",
                            }}
                          >
                            Candidates
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {election.totalCandidates}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--clr-text-tertiary)",
                            }}
                          >
                            Registered Voters
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {election.totalRegisteredVoters}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--clr-text-tertiary)",
                            }}
                          >
                            Turnout
                          </p>
                          <p
                            className="text-lg font-bold"
                            style={{
                              color: "var(--clr-text-primary)",
                            }}
                          >
                            {election.voterTurnout}%
                          </p>
                        </div>
                      </div>

                      {/* Winner */}
                      <div className="mb-4">
                        {election.winner && election.winner.isDraw ? (
                          <div className="flex items-center">
                            <AlertTriangle
                              className="w-5 h-5 mr-2"
                              style={{
                                color: "var(--clr-warning-text)",
                              }}
                            />
                            <span
                              className="font-semibold"
                              style={{
                                color: "var(--clr-warning-text)",
                              }}
                            >
                              Draw - {election.winner.candidates.length}{" "}
                              candidates tied
                            </span>
                          </div>
                        ) : election.winner && !election.winner.isDraw ? (
                          <div className="flex items-center">
                            <Trophy
                              className="w-5 h-5 mr-2"
                              style={{
                                color: "var(--clr-success-text)",
                              }}
                            />
                            <span
                              className="font-semibold"
                              style={{
                                color: "var(--clr-text-primary)",
                              }}
                            >
                              Winner:{" "}
                              {election.winner.candidates &&
                              election.winner.candidates.length > 0
                                ? `${election.winner.candidates[0].name} (${election.winner.candidates[0].party})`
                                : "Unknown"}{" "}
                              ({election.winner.voteCount} votes)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Vote
                              className="w-5 h-5 mr-2"
                              style={{
                                color: "var(--clr-text-tertiary)",
                              }}
                            />
                            <span
                              style={{
                                color: "var(--clr-text-tertiary)",
                              }}
                            >
                              No votes cast
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2 ml-6">
                      <button
                        onClick={() =>
                          viewElectionDetails(election.electionNumber)
                        }
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-lg transition duration-200 flex items-center"
                        style={{
                          backgroundColor: "var(--clr-primary-a10)",
                          color: "var(--clr-text-inverse)",
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
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          setShowDeleteModal(election.electionNumber)
                        }
                        className="px-4 py-2 rounded-lg transition duration-200 flex items-center border"
                        style={{
                          backgroundColor: "var(--clr-surface-secondary)",
                          borderColor: "var(--clr-error-border)",
                          color: "var(--clr-error-text)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor =
                            "var(--clr-error-surface)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor =
                            "var(--clr-surface-secondary)";
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div
                className="text-sm"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalElections} total elections)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 rounded-lg transition duration-200"
                  style={{
                    backgroundColor: pagination.hasPrev
                      ? "var(--clr-surface-a30)"
                      : "var(--clr-surface-a20)",
                    color: pagination.hasPrev
                      ? "var(--clr-text-primary)"
                      : "var(--clr-text-tertiary)",
                    cursor: pagination.hasPrev ? "pointer" : "not-allowed",
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 rounded-lg transition duration-200"
                  style={{
                    backgroundColor: pagination.hasNext
                      ? "var(--clr-surface-a30)"
                      : "var(--clr-surface-a20)",
                    color: pagination.hasNext
                      ? "var(--clr-text-primary)"
                      : "var(--clr-text-tertiary)",
                    cursor: pagination.hasNext ? "pointer" : "not-allowed",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Election Details Modal */}
        {selectedElection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: "var(--clr-surface-secondary)",
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    Election #{selectedElection.electionNumber} -{" "}
                    {selectedElection.electionName}
                  </h3>
                  <button
                    onClick={() => setSelectedElection(null)}
                    className="text-2xl font-bold"
                    style={{
                      color: "var(--clr-text-secondary)",
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Election Results */}
                <div className="space-y-6">
                  {/* Winner Section */}
                  {selectedElection.winner && (
                    <div
                      className="rounded-lg p-6 border-2"
                      style={{
                        backgroundColor: "var(--clr-surface-a20)",
                        borderColor: "var(--clr-surface-a40)",
                      }}
                    >
                      {selectedElection.winner.isDraw ? (
                        <div>
                          <div className="flex items-center mb-4">
                            <AlertTriangle
                              className="w-6 h-6 mr-2"
                              style={{
                                color: "var(--clr-warning-text)",
                              }}
                            />
                            <h4
                              className="text-xl font-bold"
                              style={{
                                color: "var(--clr-text-primary)",
                              }}
                            >
                              Draw Result
                            </h4>
                          </div>
                          <p
                            className="mb-4"
                            style={{
                              color: "var(--clr-text-secondary)",
                            }}
                          >
                            {selectedElection.winner.candidates.length}{" "}
                            candidates tied with{" "}
                            {selectedElection.winner.voteCount} votes each
                          </p>
                          <div className="space-y-2">
                            {selectedElection.winner.candidates.map(
                              (candidate, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded"
                                  style={{
                                    backgroundColor: "var(--clr-surface-a10)",
                                  }}
                                >
                                  <span
                                    className="font-semibold"
                                    style={{
                                      color: "var(--clr-text-primary)",
                                    }}
                                  >
                                    {candidate.name} ({candidate.party})
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{
                                      color: "var(--clr-text-primary)",
                                    }}
                                  >
                                    {candidate.voteCount} votes
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center mb-4">
                            <Trophy
                              className="w-6 h-6 mr-2"
                              style={{
                                color: "var(--clr-success-text)",
                              }}
                            />
                            <h4
                              className="text-xl font-bold"
                              style={{
                                color: "var(--clr-text-primary)",
                              }}
                            >
                              Winner
                            </h4>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className="text-2xl font-bold"
                                style={{
                                  color: "var(--clr-text-primary)",
                                }}
                              >
                                {selectedElection.winner.candidates &&
                                selectedElection.winner.candidates.length > 0
                                  ? selectedElection.winner.candidates[0].name
                                  : "Unknown"}
                              </p>
                              <p
                                className="text-lg"
                                style={{
                                  color: "var(--clr-text-secondary)",
                                }}
                              >
                                {selectedElection.winner.candidates &&
                                selectedElection.winner.candidates.length > 0
                                  ? selectedElection.winner.candidates[0].party
                                  : "Unknown"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-3xl font-bold"
                                style={{
                                  color: "var(--clr-text-primary)",
                                }}
                              >
                                {selectedElection.winner.voteCount}
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
                    </div>
                  )}

                  {/* All Candidates Results */}
                  <div>
                    <h4
                      className="text-xl font-bold mb-4"
                      style={{
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      Complete Results
                    </h4>
                    <div className="space-y-3">
                      {selectedElection.candidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="rounded-lg p-4 border"
                          style={{
                            backgroundColor: "var(--clr-surface-a10)",
                            borderColor: "var(--clr-surface-a20)",
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
                                <h5
                                  className="text-lg font-bold"
                                  style={{
                                    color: "var(--clr-text-primary)",
                                  }}
                                >
                                  {candidate.name}
                                </h5>
                                <p
                                  style={{ color: "var(--clr-text-secondary)" }}
                                >
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
                          {/* Progress Bar */}
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
                                  selectedElection.totalVotes > 0
                                    ? (candidate.voteCount /
                                        selectedElection.totalVotes) *
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
                            {selectedElection.totalVotes > 0
                              ? (
                                  (candidate.voteCount /
                                    selectedElection.totalVotes) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
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
                Delete Election?
              </h3>
              <p
                className="mb-6"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Are you sure you want to permanently delete Election #
                {showDeleteModal} from history? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg transition duration-200 font-semibold border"
                  style={{
                    backgroundColor: "var(--clr-surface-secondary)",
                    color: "var(--clr-text-primary)",
                    borderColor: "var(--clr-surface-a40)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteElection(showDeleteModal)}
                  disabled={actionLoading}
                  className="flex-1 py-3 px-4 rounded-lg font-semibold transition duration-200"
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {actionLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
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

export default ElectionHistory;
