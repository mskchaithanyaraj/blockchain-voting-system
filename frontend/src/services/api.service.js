import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request for debugging (remove in production)
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    console.log(`[API Response] ${response.config.url}`, response.data);

    return response;
  },
  (error) => {
    console.error("[API Response Error]", error);

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle unauthorized (401)
      if (status === 401) {
        console.error("Unauthorized access. Redirecting to login...");

        // Clear authentication data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // Handle forbidden (403)
      if (status === 403) {
        console.error("Access forbidden:", data.message);
      }

      // Handle not found (404)
      if (status === 404) {
        console.error("Resource not found:", data.message);
      }

      // Handle server errors (500+)
      if (status >= 500) {
        console.error("Server error:", data.message);
      }

      // Return error response for component handling
      return Promise.reject({
        status,
        message: data.message || "An error occurred",
        data: data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response from server. Check network connection.");
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    } else {
      // Something else happened
      console.error("Request error:", error.message);
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

// ============================================
// Authentication API Endpoints
// ============================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} API response
 */
export const register = (userData) => {
  return api.post("/auth/register", userData);
};

/**
 * Login user
 * @param {Object} credentials - Login credentials (email, password)
 * @returns {Promise} API response with token and user data
 */
export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

/**
 * Get current user profile
 * @returns {Promise} API response with user data
 */
export const getProfile = () => {
  return api.get("/auth/profile");
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} API response
 */
export const updateProfile = (profileData) => {
  return api.put("/auth/profile", profileData);
};

/**
 * Logout user (client-side token removal)
 * @returns {Promise} API response
 */
export const logout = () => {
  return api.post("/auth/logout");
};

/**
 * Refresh JWT token
 * @returns {Promise} API response with new token
 */
export const refreshToken = () => {
  return api.post("/auth/refresh-token");
};

// ============================================
// Admin API Endpoints
// ============================================

/**
 * Add a new candidate (Admin only)
 * @param {Object} candidateData - Candidate data (name, party)
 * @returns {Promise} API response
 */
export const addCandidate = (candidateData) => {
  return api.post("/admin/candidates", candidateData);
};

/**
 * Register a single voter (Admin only)
 * @param {Object} voterData - Voter data (voterAddress)
 * @returns {Promise} API response
 */
export const registerVoter = (voterData) => {
  return api.post("/admin/voters/register", voterData);
};

/**
 * Register multiple voters in batch (Admin only)
 * @param {Object} votersData - Voters data (voterAddresses array)
 * @returns {Promise} API response
 */
export const registerVotersBatch = (votersData) => {
  return api.post("/admin/voters/register-batch", votersData);
};

/**
 * Start the election (Admin only)
 * @returns {Promise} API response
 */
export const startElection = () => {
  return api.post("/admin/election/start");
};

/**
 * End the election (Admin only)
 * @returns {Promise} API response
 */
export const endElection = () => {
  return api.post("/admin/election/end");
};

/**
 * Get all candidates (Admin)
 * @returns {Promise} API response with candidates list
 */
export const getAllCandidatesAdmin = () => {
  return api.get("/admin/candidates");
};

/**
 * Get election results (Admin)
 * @returns {Promise} API response with results
 */
export const getResultsAdmin = () => {
  return api.get("/admin/election/results");
};

// ============================================
// Voter API Endpoints
// ============================================

/**
 * Cast a vote (Voter only)
 * @param {Object} voteData - Vote data (candidateId, voterPrivateKey)
 * @returns {Promise} API response
 */
export const castVote = (voteData) => {
  return api.post("/voter/vote", voteData);
};

/**
 * Get voter status
 * @returns {Promise} API response with voter status
 */
export const getVoterStatus = () => {
  return api.get("/voter/status");
};

/**
 * Get all candidates (Voter)
 * @returns {Promise} API response with candidates list
 */
export const getCandidates = () => {
  return api.get("/voter/candidates");
};

/**
 * Get election state
 * @returns {Promise} API response with election state
 */
export const getElectionState = () => {
  return api.get("/voter/election/state");
};

/**
 * Get election results (Voter)
 * @returns {Promise} API response with results
 */
export const getResults = () => {
  return api.get("/voter/results");
};

/**
 * Get my vote details
 * @returns {Promise} API response with vote details
 */
export const getMyVote = () => {
  return api.get("/voter/my-vote");
};

// ============================================
// Utility Functions
// ============================================

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Export default axios instance for custom requests
export default api;
