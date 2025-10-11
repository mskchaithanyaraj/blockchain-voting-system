import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  Mail,
  Wallet,
  Vote,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Manage Voters Page
 * Register voters (single/batch) and view registered voters
 */
const ManageVoters = () => {
  const [voterCount, setVoterCount] = useState(0);
  const [voters, setVoters] = useState([]);
  const [voterStats, setVoterStats] = useState({
    totalRegistered: 0,
    totalVoted: 0,
    pendingVotes: 0,
    turnoutPercentage: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVoters: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [votersLoading, setVotersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Single voter form
  const [singleVoterAddress, setSingleVoterAddress] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // Batch voters form
  const [batchAddresses, setBatchAddresses] = useState("");
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  useEffect(() => {
    fetchElectionStats();
    fetchVoters();
  }, []);

  const fetchElectionStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getElectionStats();
      setVoterCount(response.data.data.registeredVoterCount || 0);
    } catch (err) {
      console.error("Error fetching election stats:", err);
      setError(err.message || "Failed to fetch election statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoters = async (page = 1) => {
    try {
      setVotersLoading(true);
      setError(null);

      const response = await apiService.getRegisteredVoters({
        page,
        limit: 4,
      });

      const data = response.data.data;
      setVoters(data.voters || []);
      setVoterStats(data.statistics || {});
      setPagination(data.pagination || {});
    } catch (err) {
      console.error("Error fetching voters:", err);
      setError(err.message || "Failed to fetch voters");
    } finally {
      setVotersLoading(false);
    }
  };

  const handleSingleVoterSubmit = async (e) => {
    e.preventDefault();

    if (!singleVoterAddress.trim()) {
      setError("Please enter a voter address");
      return;
    }

    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(singleVoterAddress.trim())) {
      setError("Invalid Ethereum address format");
      return;
    }

    try {
      setSingleSubmitting(true);
      setError(null);
      setSuccess(null);

      await apiService.registerVoter({
        voterAddress: singleVoterAddress.trim(),
      });

      setSuccess(`Voter ${singleVoterAddress} registered successfully!`);
      setSingleVoterAddress("");
      await fetchElectionStats();
      await fetchVoters(); // Refresh voter list

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error registering voter:", err);
      setError(err.message || "Failed to register voter");
    } finally {
      setSingleSubmitting(false);
    }
  };

  const handleBatchVotersSubmit = async (e) => {
    e.preventDefault();

    if (!batchAddresses.trim()) {
      setError("Please enter voter addresses");
      return;
    }

    // Split by newlines and filter empty lines
    const addresses = batchAddresses
      .split("\n")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);

    if (addresses.length === 0) {
      setError("No valid addresses found");
      return;
    }

    // Validate all addresses
    const invalidAddresses = addresses.filter(
      (addr) => !/^0x[a-fA-F0-9]{40}$/.test(addr)
    );

    if (invalidAddresses.length > 0) {
      setError(
        `Invalid address format: ${invalidAddresses[0]} (and ${
          invalidAddresses.length - 1
        } more)`
      );
      return;
    }

    try {
      setBatchSubmitting(true);
      setError(null);
      setSuccess(null);

      await apiService.registerVotersBatch({
        voterAddresses: addresses,
      });

      setSuccess(`Successfully registered ${addresses.length} voters!`);
      setBatchAddresses("");
      await fetchElectionStats();
      await fetchVoters(); // Refresh voter list

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error registering voters batch:", err);
      setError(err.message || "Failed to register voters");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchElectionStats();
    fetchVoters(pagination.currentPage);
  };

  const handlePageChange = (newPage) => {
    fetchVoters(newPage);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredVoters = voters.filter(
    (voter) =>
      voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.ethAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Manage Voters
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Register voters and view all registered voters
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Single Voter Registration */}
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
              Register Single Voter
            </h2>
            <form onSubmit={handleSingleVoterSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="voterAddress"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--clr-text-secondary)" }}
                >
                  Voter Ethereum Address *
                </label>
                <input
                  type="text"
                  id="voterAddress"
                  value={singleVoterAddress}
                  onChange={(e) => setSingleVoterAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors font-mono text-sm"
                  style={{
                    backgroundColor: "var(--clr-surface-a10)",
                    borderColor: "var(--clr-surface-a30)",
                    color: "var(--clr-text-primary)",
                  }}
                  placeholder="0x..."
                  required
                />
                <p
                  className="mt-2 text-xs"
                  style={{
                    color: "var(--clr-text-tertiary)",
                  }}
                >
                  Enter the voter's Ethereum wallet address (must start with 0x)
                </p>
              </div>

              <button
                type="submit"
                disabled={singleSubmitting}
                className="w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: singleSubmitting
                    ? "var(--clr-surface-a40)"
                    : "var(--clr-success-primary)",
                  color: "var(--clr-text-inverse)",
                  cursor: singleSubmitting ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!singleSubmitting) {
                    e.target.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!singleSubmitting) {
                    e.target.style.opacity = "1";
                  }
                }}
              >
                {singleSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Register Voter
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Batch Voter Registration */}
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
              Register Multiple Voters
            </h2>
            <form onSubmit={handleBatchVotersSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="batchAddresses"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--clr-text-secondary)" }}
                >
                  Voter Addresses (one per line) *
                </label>
                <textarea
                  id="batchAddresses"
                  value={batchAddresses}
                  onChange={(e) => setBatchAddresses(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors font-mono text-sm"
                  style={{
                    backgroundColor: "var(--clr-surface-a10)",
                    borderColor: "var(--clr-surface-a30)",
                    color: "var(--clr-text-primary)",
                  }}
                  rows="8"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5971415
0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7
..."
                  required
                />
                <p
                  className="mt-2 text-xs"
                  style={{
                    color: "var(--clr-text-tertiary)",
                  }}
                >
                  Enter one Ethereum address per line
                </p>
              </div>

              <button
                type="submit"
                disabled={batchSubmitting}
                className="w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: batchSubmitting
                    ? "var(--clr-surface-a40)"
                    : "var(--clr-success-primary)",
                  color: "var(--clr-text-inverse)",
                  cursor: batchSubmitting ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!batchSubmitting) {
                    e.target.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!batchSubmitting) {
                    e.target.style.opacity = "1";
                  }
                }}
              >
                {batchSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Users className="h-5 w-5 mr-2" />
                    Register Voters (Batch)
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Registered Voters List */}
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
              Registered Voters ({voterStats.totalRegistered || voterCount})
            </h2>
            <button
              onClick={handleRefresh}
              className="flex items-center font-medium transition-colors"
              style={{ color: "var(--clr-text-secondary)" }}
              onMouseEnter={(e) => {
                e.target.style.color = "var(--clr-text-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--clr-text-secondary)";
              }}
            >
              <RefreshCw className="w-5 h-5 mr-1" />
              Refresh
            </button>
          </div>

          {loading || votersLoading ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
                style={{
                  border: "4px solid var(--clr-surface-primary)",
                  borderTop: "4px solid var(--clr-text-primary)",
                }}
              ></div>
              <p style={{ color: "var(--clr-text-secondary)" }}>
                Loading voters...
              </p>
            </div>
          ) : voters.length === 0 ? (
            <div className="text-center py-12">
              <Users
                className="w-16 h-16 mx-auto mb-4"
                style={{
                  color: "var(--clr-text-tertiary)",
                }}
              />
              <p
                className="text-lg mb-2"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                No voters registered yet
              </p>
              <p
                className="text-sm"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Register voters using the forms above
              </p>
            </div>
          ) : (
            <>
              {/* Voter Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--clr-surface-a10)" }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--clr-text-primary)" }}
                  >
                    {voterStats.totalRegistered}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--clr-text-secondary)" }}
                  >
                    Total Registered
                  </p>
                </div>
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--clr-success-surface)" }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--clr-success-text)" }}
                  >
                    {voterStats.totalVoted}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--clr-success-text)" }}
                  >
                    Already Voted
                  </p>
                </div>
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--clr-warning-surface)" }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--clr-warning-text)" }}
                  >
                    {voterStats.pendingVotes}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--clr-warning-text)" }}
                  >
                    Pending Votes
                  </p>
                </div>
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "var(--clr-surface-a10)" }}
                >
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "var(--clr-text-primary)" }}
                  >
                    {voterStats.turnoutPercentage}%
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--clr-text-secondary)" }}
                  >
                    Turnout Rate
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                    style={{ color: "var(--clr-text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search voters by name, email, or address..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border transition duration-200"
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
              </div>

              {/* Voter List */}
              <div className="space-y-4 mb-6">
                {filteredVoters.map((voter) => (
                  <div
                    key={voter.ethAddress}
                    className="rounded-lg p-4 border transition duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: "var(--clr-surface-a10)",
                      borderColor: voter.hasVoted
                        ? "var(--clr-success-border)"
                        : "var(--clr-surface-a20)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: voter.hasVoted
                              ? "var(--clr-success-primary)"
                              : "var(--clr-surface-a30)",
                          }}
                        >
                          <User
                            className="w-6 h-6"
                            style={{
                              color: voter.hasVoted
                                ? "white"
                                : "var(--clr-text-secondary)",
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4
                              className="font-semibold text-lg"
                              style={{ color: "var(--clr-text-primary)" }}
                            >
                              {voter.name}
                            </h4>
                            {voter.hasVoted && (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: "var(--clr-success-surface)",
                                  color: "var(--clr-success-text)",
                                }}
                              >
                                ✓ Voted
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Mail
                                className="w-4 h-4"
                                style={{ color: "var(--clr-text-tertiary)" }}
                              />
                              <span
                                style={{ color: "var(--clr-text-secondary)" }}
                              >
                                {voter.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Wallet
                                className="w-4 h-4"
                                style={{ color: "var(--clr-text-tertiary)" }}
                              />
                              <span
                                className="font-mono text-xs"
                                style={{ color: "var(--clr-text-secondary)" }}
                              >
                                {formatAddress(voter.ethAddress)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--clr-text-tertiary)" }}
                              />
                              <span
                                style={{ color: "var(--clr-text-secondary)" }}
                              >
                                {formatDate(voter.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {voter.hasVoted && (
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Vote
                              className="w-4 h-4"
                              style={{ color: "var(--clr-success-text)" }}
                            />
                            <span
                              className="text-sm font-medium"
                              style={{ color: "var(--clr-success-text)" }}
                            >
                              Candidate #{voter.votedCandidateId}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p
                    className="text-sm"
                    style={{ color: "var(--clr-text-secondary)" }}
                  >
                    Showing {(pagination.currentPage - 1) * 4 + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * 4,
                      pagination.totalVoters
                    )}{" "}
                    of {pagination.totalVoters} voters
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrev}
                      className="p-2 rounded-lg transition duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: pagination.hasPrev
                          ? "var(--clr-surface-a20)"
                          : "var(--clr-surface-a10)",
                        color: pagination.hasPrev
                          ? "var(--clr-text-primary)"
                          : "var(--clr-text-tertiary)",
                        cursor: pagination.hasPrev ? "pointer" : "not-allowed",
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span
                      className="px-3 py-1 rounded-lg"
                      style={{
                        backgroundColor: "var(--clr-surface-a20)",
                        color: "var(--clr-text-primary)",
                      }}
                    >
                      {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                      className="p-2 rounded-lg transition duration-200 disabled:opacity-50"
                      style={{
                        backgroundColor: pagination.hasNext
                          ? "var(--clr-surface-a20)"
                          : "var(--clr-surface-a10)",
                        color: pagination.hasNext
                          ? "var(--clr-text-primary)"
                          : "var(--clr-text-tertiary)",
                        cursor: pagination.hasNext ? "pointer" : "not-allowed",
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVoters;
