import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import VoterRoute from "./components/VoterRoute";

// Pages
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCandidates from "./pages/ManageCandidates";
import ManageVoters from "./pages/ManageVoters";
import ManageElection from "./pages/ManageElection";
import VoterDashboard from "./pages/VoterDashboard";
import CastVote from "./pages/CastVote";
import ViewResults from "./pages/ViewResults";

/**
 * Main App Component
 * Sets up routing and authentication context for the entire application
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/candidates"
              element={
                <AdminRoute>
                  <ManageCandidates />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/voters"
              element={
                <AdminRoute>
                  <ManageVoters />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/election"
              element={
                <AdminRoute>
                  <ManageElection />
                </AdminRoute>
              }
            />

            {/* Voter Routes */}
            <Route
              path="/voter/dashboard"
              element={
                <VoterRoute>
                  <VoterDashboard />
                </VoterRoute>
              }
            />
            <Route
              path="/voter/vote"
              element={
                <VoterRoute>
                  <CastVote />
                </VoterRoute>
              }
            />
            <Route
              path="/voter/results"
              element={
                <VoterRoute>
                  <ViewResults />
                </VoterRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-200 font-semibold"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default App;
