import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  UserCheck,
  Vote,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  Wallet,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import * as apiService from "../services/api.service";
import * as web3Provider from "../web3/web3Provider";

/**
 * Voter Dashboard - Overview Page
 * Displays voter status, registration info, and election state
 */
const VoterDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundColor: "var(--clr-background-primary)",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{
              borderColor: isDark
                ? "var(--clr-surface-a30)"
                : "var(--clr-surface-a40)",
            }}
          ></div>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Loading dashboard...
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
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Voter Dashboard
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Welcome back, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 border rounded-lg p-4"
            style={{
              backgroundColor: "var(--clr-error-surface)",
              borderColor: "var(--clr-error-border)",
              color: "var(--clr-error-text)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle
                  className="h-5 w-5"
                  style={{ color: "var(--clr-error-primary)" }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Election Status Banner */}
        <div
          className="mb-6 rounded-lg shadow-lg p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
            color: "var(--clr-text-primary)",
            borderBottom: `1px solid var(--clr-surface-a20)`,
          }}
        >
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
        <div
          className="mb-6 rounded-lg shadow-md p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            MetaMask Wallet
          </h3>
          {!web3Provider.isMetaMaskInstalled() ? (
            <div
              className={`border rounded-lg p-4 ${
                isDark
                  ? "bg-yellow-900/20 border-yellow-800 text-yellow-200"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExternalLink
                    className={`h-5 w-5 ${
                      isDark ? "text-yellow-400" : "text-yellow-400"
                    }`}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    MetaMask is not installed. Please install MetaMask to vote.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm underline font-semibold ${
                      isDark ? "text-yellow-300" : "text-yellow-900"
                    }`}
                  >
                    Download MetaMask
                  </a>
                </div>
              </div>
            </div>
          ) : walletConnected ? (
            <div>
              <div
                className={`flex items-center justify-between border rounded-lg p-4 mb-4 ${
                  isDark
                    ? "bg-green-900/20 border-green-800"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`rounded-full p-2 ${
                      isDark ? "bg-green-800" : "bg-green-100"
                    }`}
                  >
                    <CheckCircle
                      className={`w-6 h-6 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Connected Address
                    </p>
                    <p
                      className={`font-mono text-sm font-semibold ${
                        isDark ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {walletAddress
                        ? `${walletAddress.slice(
                            0,
                            10
                          )}...${walletAddress.slice(-8)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isDark
                      ? "bg-green-900/30 text-green-300"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  Connected
                </span>
              </div>

              {/* Account Management Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSwitchAccount}
                  className={`flex-1 px-4 py-2 rounded-lg transition duration-200 font-semibold text-sm ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  Switch Account
                </button>
                <button
                  onClick={handleDisconnectWallet}
                  className={`flex-1 px-4 py-2 rounded-lg transition duration-200 font-semibold text-sm ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p
                className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Connect your MetaMask wallet to participate in voting
              </p>
              <button
                onClick={handleConnectWallet}
                className={`flex items-center px-6 py-3 rounded-lg transition duration-200 font-semibold ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect MetaMask
              </button>
            </div>
          )}
        </div>

        {/* Voter Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Registration Status */}
          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                Registration
              </h3>
              {voterStatus.isRegistered ? (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--clr-success-surface)",
                    color: "var(--clr-success-text)",
                  }}
                >
                  Registered
                </span>
              ) : (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--clr-error-surface)",
                    color: "var(--clr-error-text)",
                  }}
                >
                  Not Registered
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: voterStatus.isRegistered
                    ? "var(--clr-success-surface)"
                    : "var(--clr-error-surface)",
                }}
              >
                <UserCheck
                  className="w-8 h-8"
                  style={{
                    color: voterStatus.isRegistered
                      ? "var(--clr-success-primary)"
                      : "var(--clr-error-primary)",
                  }}
                />
              </div>
              <p
                className="text-sm"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                {voterStatus.isRegistered
                  ? "You are registered to vote"
                  : "Contact admin to register"}
              </p>
            </div>
          </div>

          {/* Voting Status */}
          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                Voting Status
              </h3>
              {voterStatus.hasVoted ? (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--clr-info-a20)",
                    color: "var(--clr-info-a0)",
                  }}
                >
                  Voted
                </span>
              ) : (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--clr-surface-a30)",
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Not Voted
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: voterStatus.hasVoted
                    ? "var(--clr-info-a20)"
                    : "var(--clr-surface-a30)",
                }}
              >
                <Vote
                  className="w-8 h-8"
                  style={{
                    color: voterStatus.hasVoted
                      ? "var(--clr-info-a0)"
                      : "var(--clr-text-tertiary)",
                  }}
                />
              </div>
              <p
                className="text-sm"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                {voterStatus.hasVoted
                  ? `Voted for candidate #${voterStatus.votedCandidateId}`
                  : "You have not voted yet"}
              </p>
            </div>
          </div>

          {/* Total Candidates */}
          <div
            className="rounded-lg shadow-md p-6"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                Candidates
              </h3>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a20)",
                }}
              >
                <Users
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                />
              </div>
              <div>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {electionState.totalCandidates}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Total candidates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
          }}
        >
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: "var(--clr-text-primary)",
            }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/voter/vote"
              className="flex items-center justify-center px-4 py-3 rounded-lg transition duration-200"
              style={{
                backgroundColor:
                  voterStatus.isRegistered &&
                  !voterStatus.hasVoted &&
                  electionState.state === 1
                    ? "var(--clr-success-surface)"
                    : "var(--clr-surface-a30)",
                color:
                  voterStatus.isRegistered &&
                  !voterStatus.hasVoted &&
                  electionState.state === 1
                    ? "var(--clr-success-text)"
                    : "var(--clr-text-tertiary)",
                cursor:
                  voterStatus.isRegistered &&
                  !voterStatus.hasVoted &&
                  electionState.state === 1
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <Vote className="w-5 h-5 mr-2" />
              Cast Your Vote
            </a>
            <a
              href="/voter/results"
              className="flex items-center justify-center px-4 py-3 rounded-lg transition duration-200"
              style={{
                backgroundColor:
                  electionState.state === 2
                    ? "var(--clr-info-a20)"
                    : "var(--clr-surface-a30)",
                color:
                  electionState.state === 2
                    ? "var(--clr-info-a0)"
                    : "var(--clr-text-tertiary)",
                cursor: electionState.state === 2 ? "pointer" : "not-allowed",
              }}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Results
            </a>
            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center px-4 py-3 rounded-lg transition duration-200"
              style={{
                backgroundColor: "var(--clr-surface-a20)",
                color: "var(--clr-text-primary)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--clr-surface-a30)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "var(--clr-surface-a20)";
              }}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoterDashboard;
