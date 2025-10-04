import { createContext, useContext, useState, useEffect } from "react";
import * as apiService from "../services/api.service";

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Custom hook to use the Auth Context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived state for roles
  const isAdmin = user?.role === "admin";
  const isVoter = user?.role === "voter";

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);

          // Verify token is still valid by fetching profile
          try {
            await fetchProfile();
          } catch (err) {
            // Token invalid or expired, clear auth data
            console.error("Token validation failed:", err);
            clearAuth();
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    apiService.clearAuthData();
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user and token
   */
  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.register(userData);
      const { token: newToken, user: newUser } = response.data.data;

      // Store auth data
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      apiService.setAuthToken(newToken);

      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      console.log("Registration successful:", newUser.email);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      console.error("Registration error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} Response with user and token
   */
  const login = async (credentials) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.login(credentials);
      const { token: newToken, user: newUser } = response.data.data;

      // Store auth data
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      apiService.setAuthToken(newToken);

      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      console.log("Login successful:", newUser.email);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      setIsLoading(true);

      // Call logout API (optional - mainly for logging)
      try {
        await apiService.logout();
      } catch (err) {
        console.warn("Logout API call failed:", err);
      }

      // Clear auth state
      clearAuth();

      console.log("Logout successful");
    } catch (err) {
      console.error("Logout error:", err);
      // Clear auth state even if API call fails
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch current user profile
   * @returns {Promise<Object>} User profile data
   */
  const fetchProfile = async () => {
    try {
      setError(null);

      const response = await apiService.getProfile();
      const profileData = response.data.data;

      // Update user state
      setUser(profileData);
      localStorage.setItem("user", JSON.stringify(profileData));

      console.log("Profile fetched successfully");
      return profileData;
    } catch (err) {
      const errorMessage = err.message || "Failed to fetch profile";
      setError(errorMessage);
      console.error("Fetch profile error:", err);
      throw err;
    }
  };

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated user data
   */
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiService.updateProfile(profileData);
      const updatedUser = response.data.data;

      // Update user state
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      console.log("Profile updated successfully");
      return updatedUser;
    } catch (err) {
      const errorMessage = err.message || "Failed to update profile";
      setError(errorMessage);
      console.error("Update profile error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh JWT token
   * @returns {Promise<string>} New token
   */
  const refreshAuthToken = async () => {
    try {
      const response = await apiService.refreshToken();
      const { token: newToken } = response.data.data;

      // Update token
      localStorage.setItem("authToken", newToken);
      apiService.setAuthToken(newToken);
      setToken(newToken);

      console.log("Token refreshed successfully");
      return newToken;
    } catch (err) {
      console.error("Token refresh error:", err);
      // If refresh fails, logout user
      clearAuth();
      throw err;
    }
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check ('admin' or 'voter')
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user is registered as voter on blockchain
   * @returns {boolean} True if registered
   */
  const isRegisteredVoter = () => {
    return user?.isRegistered === true;
  };

  /**
   * Check if user has already voted
   * @returns {boolean} True if voted
   */
  const hasVoted = () => {
    return user?.hasVoted === true;
  };

  // Context value
  const value = {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isAdmin,
    isVoter,

    // Actions
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    refreshAuthToken,

    // Utility functions
    hasRole,
    isRegisteredVoter,
    hasVoted,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
