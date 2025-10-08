import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api.service";
import * as web3Provider from "../web3/web3Provider";

/**
 * Voter Dashboard - Overview Page
 * Displays voter status, registration info, and election state
 */
const VoterDashboard = () => {
  const { user } = useAuth();
  const [voterStatus, setVoterStatus] = useState({
    isRegistered: false,
    hasVoted: false,
    votedCandidateId: null,
  });
  const [electionState, setElectionState] = useState({
    state: 0,
    electionName: "",
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    checkWalletConnection();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch voter status
      const statusResponse = await apiService.getVoterStatus();
      setVoterStatus(statusResponse.data.data);

      // Fetch election state
      const stateResponse = await apiService.getElectionState();
      setElectionState(stateResponse.data.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      if (web3Provider.isMetaMaskInstalled()) {
        const address = await web3Provider.getConnectedAddress();
        if (address) {
          setWalletAddress(address);
          setWalletConnected(true);
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setError(null);
      const address = await web3Provider.connectWallet();
      await web3Provider.switchToGanache();
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    }
  };

  const handleSwitchAccount = async () => {
    try {
      setError(null);
      const address = await web3Provider.selectAccount();
      await web3Provider.switchToGanache();
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (err) {
      console.error("Error switching account:", err);
      setError(err.message || "Failed to switch account");
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletConnected(false);
    setError(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Voter Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user?.name}</span>
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

        {/* Election Status Banner */}
        <div className="mb-6 bg-green-600 text-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-2">
            {electionState.electionName || "General Election 2025"}
          </h2>
          <div className="flex items-center">
            <span className="text-sm mr-2">Status:</span>
            <span
              className={`${getStateColor(
                electionState.state
              )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
            >
              {getElectionStateText(electionState.state)}
            </span>
          </div>
        </div>

        {/* Wallet Connection Card */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            MetaMask Wallet
          </h3>
          {!web3Provider.isMetaMaskInstalled() ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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
                    MetaMask is not installed. Please install MetaMask to vote.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-yellow-900 underline font-semibold"
                  >
                    Download MetaMask
                  </a>
                </div>
              </div>
            </div>
          ) : walletConnected ? (
            <div>
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <svg
                      className="w-6 h-6 text-green-600"
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
                  <div>
                    <p className="text-sm text-gray-500">Connected Address</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {walletAddress
                        ? `${walletAddress.slice(
                            0,
                            10
                          )}...${walletAddress.slice(-8)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  Connected
                </span>
              </div>

              {/* Account Management Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSwitchAccount}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-sm"
                >
                  Switch Account
                </button>
                <button
                  onClick={handleDisconnectWallet}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 font-semibold text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your MetaMask wallet to participate in voting
              </p>
              <button
                onClick={handleConnectWallet}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
              >
                Connect MetaMask
              </button>
            </div>
          )}
        </div>

        {/* Voter Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Registration Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Registration
              </h3>
              {voterStatus.isRegistered ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Registered
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                  Not Registered
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`${
                  voterStatus.isRegistered ? "bg-green-100" : "bg-red-100"
                } rounded-full p-3`}
              >
                <svg
                  className={`w-8 h-8 ${
                    voterStatus.isRegistered ? "text-green-600" : "text-red-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                {voterStatus.isRegistered
                  ? "You are registered to vote"
                  : "Contact admin to register"}
              </p>
            </div>
          </div>

          {/* Voting Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Voting Status
              </h3>
              {voterStatus.hasVoted ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  Voted
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                  Not Voted
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`${
                  voterStatus.hasVoted ? "bg-blue-100" : "bg-gray-100"
                } rounded-full p-3`}
              >
                <svg
                  className={`w-8 h-8 ${
                    voterStatus.hasVoted ? "text-blue-600" : "text-gray-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                {voterStatus.hasVoted
                  ? `Voted for candidate #${voterStatus.votedCandidateId}`
                  : "You have not voted yet"}
              </p>
            </div>
          </div>

          {/* Total Candidates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Candidates
              </h3>
            </div>
            <div className="flex items-center space-x-3">
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
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {electionState.totalCandidates}
                </p>
                <p className="text-sm text-gray-600">Total candidates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/voter/vote"
              className={`flex items-center justify-center px-4 py-3 rounded-lg transition duration-200 ${
                voterStatus.isRegistered &&
                !voterStatus.hasVoted &&
                electionState.state === 1
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Cast Your Vote
            </a>
            <a
              href="/voter/results"
              className={`flex items-center justify-center px-4 py-3 rounded-lg transition duration-200 ${
                electionState.state === 2
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Results
            </a>
            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;
