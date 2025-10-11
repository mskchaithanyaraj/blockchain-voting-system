import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Users,
  UserCheck,
  Vote,
  BarChart3,
  Settings,
  RefreshCw,
  Plus,
  Calendar,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Admin Dashboard - Overview Page
 * Displays statistics and current election state
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    registeredVoters: 0,
    totalVotes: 0,
    electionState: "Not Started",
    electionName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch election statistics
      const statsResponse = await apiService.getElectionStats();
      const electionData = statsResponse.data.data;

      // Fetch all candidates
      const candidatesResponse = await apiService.getAllCandidatesAdmin();
      const candidates = candidatesResponse.data.data;

      setStats({
        totalCandidates: candidates.length,
        registeredVoters: electionData.registeredVoterCount || 0,
        totalVotes: electionData.totalVotes || 0,
        electionState: getElectionStateText(electionData.stateNumber),
        electionName: electionData.name || "General Election 2025",
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      "Not Started": "bg-gray-500",
      Active: "bg-green-500",
      Ended: "bg-red-500",
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
            Admin Dashboard
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
                <svg
                  className="h-5 w-5"
                  style={{ color: "var(--clr-error-primary)" }}
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
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Election Name Banner */}
        <div
          className="mb-6 rounded-lg shadow-lg p-6"
          style={{
            backgroundColor: "var(--clr-surface-secondary)",
            color: "var(--clr-text-primary)",
            borderBottom: `1px solid var(--clr-surface-a20)`,
          }}
        >
          <h2 className="text-2xl font-bold mb-2">{stats.electionName}</h2>
          <div className="flex items-center">
            <span className="text-sm mr-2">Status:</span>
            <span
              className={`${getStateColor(
                stats.electionState
              )} text-white px-3 py-1 rounded-full text-sm font-semibold`}
            >
              {stats.electionState}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Candidates Card */}
          <div
            className="rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{
                    color: "var(--clr-text-secondary)",
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
                  {stats.totalCandidates}
                </p>
              </div>
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
            </div>
          </div>

          {/* Registered Voters Card */}
          <div
            className="rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Registered Voters
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {stats.registeredVoters}
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a20)",
                }}
              >
                <UserCheck
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Total Votes Card */}
          <div
            className="rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Votes Cast
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {stats.totalVotes}
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a20)",
                }}
              >
                <Vote
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Voter Turnout Card */}
          <div
            className="rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            style={{
              backgroundColor: "var(--clr-surface-secondary)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                >
                  Voter Turnout
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{
                    color: "var(--clr-text-primary)",
                  }}
                >
                  {stats.registeredVoters > 0
                    ? Math.round(
                        (stats.totalVotes / stats.registeredVoters) * 100
                      )
                    : 0}
                  %
                </p>
              </div>
              <div
                className="rounded-full p-3"
                style={{
                  backgroundColor: "var(--clr-surface-a20)",
                }}
              >
                <BarChart3
                  className="w-8 h-8"
                  style={{
                    color: "var(--clr-text-secondary)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-lg shadow-md p-6 mb-8"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/candidates"
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
              <Plus className="w-5 h-5 mr-2" />
              Manage Candidates
            </a>
            <a
              href="/admin/voters"
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
              <UserCheck className="w-5 h-5 mr-2" />
              Manage Voters
            </a>
            <a
              href="/admin/election"
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
              <Settings className="w-5 h-5 mr-2" />
              Manage Election
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

        {/* System Information */}
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
            System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p
                className="text-sm mb-1"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Admin Email
              </p>
              <p
                className="font-medium"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {user?.email}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-1"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Wallet Address
              </p>
              <p
                className="font-medium font-mono text-sm"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {user?.ethAddress
                  ? `${user.ethAddress.slice(0, 10)}...${user.ethAddress.slice(
                      -8
                    )}`
                  : "Not connected"}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-1"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Last Login
              </p>
              <p
                className="font-medium"
                style={{
                  color: "var(--clr-text-primary)",
                }}
              >
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p
                className="text-sm mb-1"
                style={{
                  color: "var(--clr-text-secondary)",
                }}
              >
                Account Status
              </p>
              <span
                className="inline-block px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: "var(--clr-success-surface)",
                  color: "var(--clr-success-text)",
                }}
              >
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
