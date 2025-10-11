import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

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
import ElectionHistory from "./pages/ElectionHistory";
import VoterDashboard from "./pages/VoterDashboard";
import CastVote from "./pages/CastVote";
import ViewResults from "./pages/ViewResults";

/**
 * Main App Component
 * Sets up routing, theme system, and authentication context for the entire application
 */
const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div
            className="min-h-screen transition-theme"
            style={{
              backgroundColor: "var(--clr-surface-a0)",
              color: "var(--clr-text-primary)",
            }}
          >
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
              <Route
                path="/admin/history"
                element={
                  <AdminRoute>
                    <ElectionHistory />
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
    </ThemeProvider>
  );
};

/**
 * 404 Not Found Page
 */
const NotFound = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-theme"
      style={{
        backgroundColor: "var(--clr-surface-a10)",
      }}
    >
      <div className="text-center animate-fade-in">
        <h1
          className="text-display-large"
          style={{ color: "var(--clr-surface-a40)" }}
        >
          404
        </h1>
        <h2
          className="text-headline-large mb-4"
          style={{ color: "var(--clr-text-primary)" }}
        >
          Page Not Found
        </h2>
        <p
          className="text-body-large mb-8"
          style={{ color: "var(--clr-text-secondary)" }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-lg font-semibold transition-theme shadow-medium hover:shadow-heavy"
          style={{
            backgroundColor: "var(--clr-primary-a0)",
            color: "var(--clr-text-inverse)",
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default App;
