import { useState, useEffect } from "react";
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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Manage Voters
          </h1>
          <p className="text-gray-600">
            Register voters and view all registered voters
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Single Voter Registration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Register Single Voter
            </h2>
            <form onSubmit={handleSingleVoterSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="voterAddress"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Voter Ethereum Address *
                </label>
                <input
                  type="text"
                  id="voterAddress"
                  value={singleVoterAddress}
                  onChange={(e) => setSingleVoterAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  placeholder="0x..."
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the voter's Ethereum wallet address (must start with 0x)
                </p>
              </div>

              <button
                type="submit"
                disabled={singleSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                  singleSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {singleSubmitting ? (
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
                    Registering...
                  </span>
                ) : (
                  "Register Voter"
                )}
              </button>
            </form>
          </div>

          {/* Batch Voter Registration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Register Multiple Voters
            </h2>
            <form onSubmit={handleBatchVotersSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="batchAddresses"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Voter Addresses (one per line) *
                </label>
                <textarea
                  id="batchAddresses"
                  value={batchAddresses}
                  onChange={(e) => setBatchAddresses(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  rows="8"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5971415
0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7
..."
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter one Ethereum address per line
                </p>
              </div>

              <button
                type="submit"
                disabled={batchSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                  batchSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {batchSubmitting ? (
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
                    Registering...
                  </span>
                ) : (
                  "Register Voters (Batch)"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Registered Voters List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Registered Voters ({voterCount})
            </h2>
            <button
              onClick={fetchElectionStats}
              className="flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <svg
                className="w-5 h-5 mr-1"
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
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading voters...</p>
            </div>
          ) : voterCount === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-2">
                No voters registered yet
              </p>
              <p className="text-gray-500 text-sm">
                Register voters using the forms above
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-green-400 mx-auto mb-4"
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
              <p className="text-gray-600 text-lg mb-2">
                {voterCount} voters registered
              </p>
              <p className="text-gray-500 text-sm">
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
