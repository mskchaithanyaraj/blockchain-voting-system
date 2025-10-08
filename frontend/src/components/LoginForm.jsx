import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
const LoginForm = () => {
  const { login, isAdmin, isVoter } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect based on role
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else if (isVoter) {
        navigate("/voter/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Logging in..." />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ backgroundColor: "var(--clr-background-primary)" }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center backdrop-blur-sm border shadow-lg transition-all duration-300"
            style={{
              background: "var(--clr-gradient-primary)",
              borderColor: "var(--clr-surface-a10)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <svg
              className="w-10 h-10"
              style={{ color: "var(--clr-text-on-accent)" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2
            className="mt-6 text-heading-2 font-medium transition-colors duration-300"
            style={{ color: "var(--clr-text-primary)" }}
          >
            Sign in to your account
          </h2>
          <p
            className="mt-2 text-body-2 transition-colors duration-300"
            style={{ color: "var(--clr-text-secondary)" }}
          >
            Or{" "}
            <Link
              to="/register"
              className="font-medium transition-colors duration-200 hover:underline"
              style={{ color: "var(--clr-accent-primary)" }}
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <div
          className="rounded-xl p-8 backdrop-blur-sm border transition-all duration-300"
          style={{
            backgroundColor: "var(--clr-surface-primary)",
            borderColor: "var(--clr-surface-a10)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <ErrorMessage message={error} onDismiss={() => setError(null)} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--clr-surface-secondary)",
                  borderColor: "var(--clr-surface-a20)",
                  color: "var(--clr-text-primary)",
                  "--placeholder-color": "var(--clr-text-muted)",
                  focusRingColor: "var(--clr-accent-primary)",
                  focusRingOffsetColor: "var(--clr-surface-primary)",
                }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: "var(--clr-surface-secondary)",
                  borderColor: "var(--clr-surface-a20)",
                  color: "var(--clr-text-primary)",
                  "--placeholder-color": "var(--clr-text-muted)",
                  focusRingColor: "var(--clr-accent-primary)",
                  focusRingOffsetColor: "var(--clr-surface-primary)",
                }}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-body-1 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "var(--clr-gradient-primary)",
                  color: "var(--clr-text-on-accent)",
                  boxShadow: "var(--shadow-md)",
                  focusRingColor: "var(--clr-accent-primary)",
                  focusRingOffsetColor: "var(--clr-surface-primary)",
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "var(--clr-surface-a10)" }}
                />
              </div>
              <div className="relative flex justify-center text-caption">
                <span
                  className="px-2"
                  style={{
                    backgroundColor: "var(--clr-surface-primary)",
                    color: "var(--clr-text-muted)",
                  }}
                >
                  Secure blockchain voting system
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
