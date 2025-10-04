import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Admin Route Component
 * Requires user to be authenticated AND have admin role
 * Redirects to login if not authenticated
 * Shows forbidden page if authenticated but not admin
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactNode} Children, redirect, or forbidden page
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show forbidden page if not admin
  if (!isAdmin) {
    console.log("Access denied: User is not an admin");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-20 h-20 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-2">
            You do not have permission to access this page.
          </p>
          <p className="text-gray-500 mb-6">
            This area is restricted to administrators only.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Current Role:{" "}
              <span className="font-semibold text-gray-700">
                {user?.role || "Unknown"}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Email:{" "}
              <span className="font-semibold text-gray-700">
                {user?.email || "Unknown"}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin, render children
  return children;
};

export default AdminRoute;
