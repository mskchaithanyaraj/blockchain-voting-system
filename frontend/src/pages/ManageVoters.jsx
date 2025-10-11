import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Manage Voters Page
 * Register voters (single/batch) and view registered voters
 */
const ManageVoters = () => {
  const [voterCount, setVoterCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Single voter form
  const [singleVoterAddress, setSingleVoterAddress] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // Batch voters form
  const [batchAddresses, setBatchAddresses] = useState("");
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  useEffect(() => {
    fetchElectionStats();
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

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error registering voters batch:", err);
      setError(err.message || "Failed to register voters");
    } finally {
      setBatchSubmitting(false);
    }
  };

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
              Registered Voters ({voterCount})
            </h2>
            <button
              onClick={fetchElectionStats}
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

          {loading ? (
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
          ) : voterCount === 0 ? (
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
            <div className="text-center py-12">
              <CheckCircle
                className="w-16 h-16 mx-auto mb-4"
                style={{
                  color: "var(--clr-success-primary)",
                }}
              />
              <p
                className="text-lg mb-2"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {voterCount} voters registered
              </p>
              <p
                className="text-sm"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Voters have been successfully registered on the blockchain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVoters;
