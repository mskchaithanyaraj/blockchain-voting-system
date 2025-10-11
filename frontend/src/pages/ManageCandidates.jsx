import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Plus,
  Users,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Tag,
  Vote,
} from "lucide-react";
import * as apiService from "../services/api.service";

/**
 * Manage Candidates Page
 * Add new candidates and view all existing candidates
 */
const ManageCandidates = () => {
  const { isDark } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    party: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getAllCandidatesAdmin();
      setCandidates(response.data.data || []);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError(err.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.party.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await apiService.addCandidate({
        name: formData.name.trim(),
        party: formData.party.trim(),
      });

      setSuccess(`Candidate "${formData.name}" added successfully!`);

      // Reset form
      setFormData({ name: "", party: "" });

      // Refresh candidates list
      await fetchCandidates();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error("Error adding candidate:", err);
      setError(err.message || "Failed to add candidate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: isDark
          ? "var(--clr-surface-a0)"
          : "var(--clr-surface-a10)",
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
            Manage Candidates
          </h1>
          <p style={{ color: "var(--clr-text-secondary)" }}>
            Add new candidates and view all registered candidates
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

        {/* Success Message */}
        {success && (
          <div
            className="mb-6 border rounded-lg p-4"
            style={{
              backgroundColor: "var(--clr-success-surface)",
              borderColor: "var(--clr-success-border)",
              color: "var(--clr-success-text)",
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  style={{ color: "var(--clr-success-primary)" }}
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
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Candidate Form */}
          <div className="lg:col-span-1">
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
                Add New Candidate
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--clr-text-secondary)" }}
                  >
                    Candidate Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{
                      backgroundColor: "var(--clr-surface-a10)",
                      borderColor: "var(--clr-surface-a30)",
                      color: "var(--clr-text-primary)",
                    }}
                    placeholder="Enter candidate name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="party"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--clr-text-secondary)" }}
                  >
                    Party Name *
                  </label>
                  <input
                    type="text"
                    id="party"
                    name="party"
                    value={formData.party}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{
                      backgroundColor: "var(--clr-surface-a10)",
                      borderColor: "var(--clr-surface-a30)",
                      color: "var(--clr-text-primary)",
                    }}
                    placeholder="Enter party name"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg font-semibold transition duration-200 flex items-center justify-center"
                  style={{
                    backgroundColor: submitting
                      ? "var(--clr-surface-a30)"
                      : "var(--clr-surface-a20)",
                    color: submitting
                      ? "var(--clr-text-tertiary)"
                      : "var(--clr-text-primary)",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.target.style.backgroundColor = "var(--clr-surface-a30)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.target.style.backgroundColor = "var(--clr-surface-a20)";
                    }
                  }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div
                        className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2"
                        style={{
                          borderColor: "var(--clr-text-tertiary)",
                        }}
                      ></div>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Candidate
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Candidates List */}
          <div className="lg:col-span-2">
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
                  All Candidates ({candidates.length})
                </h2>
                <button
                  onClick={fetchCandidates}
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
                    Loading candidates...
                  </p>
                </div>
              ) : candidates.length === 0 ? (
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
                    No candidates yet
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--clr-text-secondary)",
                    }}
                  >
                    Add your first candidate using the form on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates
                    .filter((candidate) => candidate && candidate.id != null)
                    .map((candidate, index) => (
                      <div
                        key={candidate.id || `candidate-${index}`}
                        className="rounded-lg p-4 transition duration-200 hover:shadow-md border"
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
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div
                              className="rounded-full p-3"
                              style={{
                                backgroundColor: "var(--clr-surface-a20)",
                              }}
                            >
                              <User
                                className="w-8 h-8"
                                style={{
                                  color: "var(--clr-text-primary)",
                                }}
                              />
                            </div>
                            <div>
                              <h3
                                className="text-lg font-bold"
                                style={{
                                  color: "var(--clr-text-primary)",
                                }}
                              >
                                {candidate.name}
                              </h3>
                              <p style={{ color: "var(--clr-text-secondary)" }}>
                                {candidate.party}
                              </p>
                              <div
                                className="mt-2 flex items-center space-x-4 text-sm"
                                style={{
                                  color: "var(--clr-text-tertiary)",
                                }}
                              >
                                <span className="flex items-center">
                                  <Tag className="w-4 h-4 mr-1" />
                                  ID: {candidate.id}
                                </span>
                                <span className="flex items-center">
                                  <Vote className="w-4 h-4 mr-1" />
                                  Votes: {candidate.voteCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCandidates;
