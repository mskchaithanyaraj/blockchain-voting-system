import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
import LoadingSpinner from "./LoadingSpinner";
import PasswordInput from "./PasswordInput";

/**
 * Register Form Component
 * Handles new user registration with role selection
 */
const RegisterForm = () => {
  const { register, isAdmin, isVoter } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ethAddress: "",
    role: "voter",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Check all fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.ethAddress
    ) {
      setError("Please fill in all fields");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Validate Ethereum address
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(formData.ethAddress)) {
      setError(
        "Please enter a valid Ethereum address (0x followed by 40 hex characters)"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ethAddress: formData.ethAddress,
        role: formData.role,
      });

      setSuccess("Registration successful! Redirecting...");

      // Redirect after 2 seconds
      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin/dashboard");
        } else if (isVoter) {
          navigate("/voter/dashboard");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Creating your account..." />;
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
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
          <h2
            className="mt-6 text-heading-2 font-medium transition-colors duration-300"
            style={{ color: "var(--clr-text-primary)" }}
          >
            Create your account
          </h2>
          <p
            className="mt-2 text-body-2 transition-colors duration-300"
            style={{ color: "var(--clr-text-secondary)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium transition-colors duration-200 hover:underline"
              style={{ color: "var(--clr-accent-primary)" }}
            >
              Sign in
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
          <SuccessMessage
            message={success}
            onDismiss={() => setSuccess(null)}
          />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
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
                placeholder="Enter your full name"
              />
            </div>

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
                htmlFor="ethAddress"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Ethereum Address
              </label>
              <input
                id="ethAddress"
                name="ethAddress"
                type="text"
                required
                value={formData.ethAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 font-mono text-caption"
                style={{
                  backgroundColor: "var(--clr-surface-secondary)",
                  borderColor: "var(--clr-surface-a20)",
                  color: "var(--clr-text-primary)",
                  "--placeholder-color": "var(--clr-text-muted)",
                  focusRingColor: "var(--clr-accent-primary)",
                  focusRingOffsetColor: "var(--clr-surface-primary)",
                }}
                placeholder="0x..."
              />
              <p
                className="mt-1 text-caption-sm transition-colors duration-300"
                style={{ color: "var(--clr-text-muted)" }}
              >
                Your Ethereum wallet address from MetaMask or Ganache
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
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
              <label
                htmlFor="confirmPassword"
                className="block text-caption font-medium mb-2 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
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
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <label
                className="block text-caption font-medium mb-3 transition-colors duration-300"
                style={{ color: "var(--clr-text-secondary)" }}
              >
                Account Type
              </label>
              <div className="space-y-3">
                <label
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor:
                      formData.role === "voter"
                        ? "var(--clr-accent-primary)"
                        : "var(--clr-surface-a20)",
                    backgroundColor:
                      formData.role === "voter"
                        ? "var(--clr-accent-surface)"
                        : "var(--clr-surface-secondary)",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="voter"
                    checked={formData.role === "voter"}
                    onChange={handleChange}
                    className="h-4 w-4 focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: "var(--clr-accent-primary)",
                      focusRingColor: "var(--clr-accent-primary)",
                    }}
                  />
                  <div className="ml-3">
                    <div
                      className="text-caption font-medium transition-colors duration-300"
                      style={{ color: "var(--clr-text-primary)" }}
                    >
                      Voter
                    </div>
                    <div
                      className="text-caption-sm transition-colors duration-300"
                      style={{ color: "var(--clr-text-muted)" }}
                    >
                      Cast votes in elections
                    </div>
                  </div>
                </label>
                <label
                  className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor:
                      formData.role === "admin"
                        ? "var(--clr-accent-primary)"
                        : "var(--clr-surface-a20)",
                    backgroundColor:
                      formData.role === "admin"
                        ? "var(--clr-accent-surface)"
                        : "var(--clr-surface-secondary)",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    className="h-4 w-4 focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: "var(--clr-accent-primary)",
                      focusRingColor: "var(--clr-accent-primary)",
                    }}
                  />
                  <div className="ml-3">
                    <div
                      className="text-caption font-medium transition-colors duration-300"
                      style={{ color: "var(--clr-text-primary)" }}
                    >
                      Administrator
                    </div>
                    <div
                      className="text-caption-sm transition-colors duration-300"
                      style={{ color: "var(--clr-text-muted)" }}
                    >
                      Manage elections and voters
                    </div>
                  </div>
                </label>
              </div>
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
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
