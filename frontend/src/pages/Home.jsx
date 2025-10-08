import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Home/Landing Page Component
 * Modern landing page with theme support and updated typography
 */
const Home = () => {
  const { isAuthenticated, isAdmin, isVoter } = useAuth();
  const { isDark } = useTheme();

  return (
    <div
      className="min-h-screen transition-theme"
      style={{
        background: isDark
          ? "linear-gradient(135deg, var(--clr-surface-a0) 0%, var(--clr-surface-a10) 50%, var(--clr-surface-a20) 100%)"
          : "linear-gradient(135deg, var(--clr-surface-a0) 0%, var(--clr-surface-tonal-a10) 50%, var(--clr-surface-tonal-a20) 100%)",
      }}
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <div className="mb-8 flex justify-center">
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center shadow-heavy transition-all duration-300 hover:scale-110"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, var(--clr-primary-a30), var(--clr-primary-a20))"
                  : "linear-gradient(135deg, var(--clr-primary-a0), var(--clr-primary-a10))",
              }}
            >
              <svg
                className="w-16 h-16"
                style={{ color: "var(--clr-surface-a0)" }}
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
          </div>

          <h1
            className="text-display-medium md:text-display-large mb-6 transition-colors duration-300"
            style={{ color: "var(--clr-text-primary)" }}
          >
            <span className="font-brand">BallotX</span> Voting System
          </h1>

          <p
            className="text-body-large md:text-title-large mb-8 max-w-3xl mx-auto transition-colors duration-300"
            style={{ color: "var(--clr-text-secondary)" }}
          >
            Secure, transparent, and tamper-proof elections powered by
            blockchain technology
          </p>

          {/* CTA Buttons */}
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className={`
                  px-8 py-4 rounded-lg font-semibold text-body-large transition-all duration-300
                  shadow-medium hover:shadow-heavy hover:scale-105 focus-ring
                `}
                style={{
                  backgroundColor: isDark
                    ? "var(--clr-primary-a20)"
                    : "var(--clr-primary-a0)",
                  color: "var(--clr-surface-a0)",
                }}
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className={`
                  px-8 py-4 rounded-lg font-semibold text-body-large transition-all duration-300
                  border-2 shadow-medium hover:shadow-heavy hover:scale-105 focus-ring
                  ${isDark ? "hover:bg-surface-a20" : "hover:bg-surface-a20"}
                `}
                style={{
                  borderColor: isDark
                    ? "var(--clr-primary-a20)"
                    : "var(--clr-primary-a0)",
                  color: isDark
                    ? "var(--clr-primary-a20)"
                    : "var(--clr-primary-a0)",
                  backgroundColor: "transparent",
                }}
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`
                    px-8 py-4 rounded-lg font-semibold text-body-large transition-all duration-300
                    shadow-medium hover:shadow-heavy hover:scale-105 focus-ring
                  `}
                  style={{
                    backgroundColor: isDark
                      ? "var(--clr-primary-a20)"
                      : "var(--clr-primary-a0)",
                    color: "var(--clr-surface-a0)",
                  }}
                >
                  Go to Admin Dashboard
                </Link>
              )}
              {isVoter && (
                <Link
                  to="/voter/dashboard"
                  className={`
                    px-8 py-4 rounded-lg font-semibold text-body-large transition-all duration-300
                    shadow-medium hover:shadow-heavy hover:scale-105 focus-ring
                  `}
                  style={{
                    backgroundColor: isDark
                      ? "var(--clr-success-a10)"
                      : "var(--clr-success-a0)",
                    color: "var(--clr-surface-a0)",
                  }}
                >
                  Go to Voter Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2
          className="text-headline-large text-center mb-12 transition-colors duration-300"
          style={{ color: "var(--clr-text-primary)" }}
        >
          Why Choose <span className="font-brand">BallotX</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div
            className="rounded-lg p-8 transition-all duration-300 hover:scale-105 shadow-medium hover:shadow-heavy"
            style={{
              backgroundColor: isDark
                ? "var(--clr-surface-a10)"
                : "var(--clr-surface-a0)",
            }}
          >
            <div
              className="rounded-full w-16 h-16 flex items-center justify-center mb-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "var(--clr-primary-a30)"
                  : "var(--clr-primary-a50)",
                color: isDark
                  ? "var(--clr-surface-a0)"
                  : "var(--clr-primary-a0)",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3
              className="text-title-large mb-3 transition-colors duration-300"
              style={{ color: "var(--clr-text-primary)" }}
            >
              Secure
            </h3>
            <p
              className="text-body-medium transition-colors duration-300"
              style={{ color: "var(--clr-text-secondary)" }}
            >
              Your vote is encrypted and stored on the blockchain, making it
              impossible to tamper with or forge.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="rounded-lg p-8 transition-all duration-300 hover:scale-105 shadow-medium hover:shadow-heavy"
            style={{
              backgroundColor: isDark
                ? "var(--clr-surface-a10)"
                : "var(--clr-surface-a0)",
            }}
          >
            <div
              className="rounded-full w-16 h-16 flex items-center justify-center mb-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "var(--clr-info-a10)"
                  : "var(--clr-info-a20)",
                color: isDark ? "var(--clr-surface-a0)" : "var(--clr-info-a0)",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3
              className="text-title-large mb-3 transition-colors duration-300"
              style={{ color: "var(--clr-text-primary)" }}
            >
              Transparent
            </h3>
            <p
              className="text-body-medium transition-colors duration-300"
              style={{ color: "var(--clr-text-secondary)" }}
            >
              All votes are recorded on a public blockchain, ensuring complete
              transparency and auditability.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="rounded-lg p-8 transition-all duration-300 hover:scale-105 shadow-medium hover:shadow-heavy"
            style={{
              backgroundColor: isDark
                ? "var(--clr-surface-a10)"
                : "var(--clr-surface-a0)",
            }}
          >
            <div
              className="rounded-full w-16 h-16 flex items-center justify-center mb-6 transition-colors duration-300"
              style={{
                backgroundColor: isDark
                  ? "var(--clr-success-a10)"
                  : "var(--clr-success-a20)",
                color: isDark
                  ? "var(--clr-surface-a0)"
                  : "var(--clr-success-a0)",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3
              className="text-title-large mb-3 transition-colors duration-300"
              style={{ color: "var(--clr-text-primary)" }}
            >
              Anonymous
            </h3>
            <p
              className="text-body-medium transition-colors duration-300"
              style={{ color: "var(--clr-text-secondary)" }}
            >
              Your vote is anonymous and private. Only you know who you voted
              for, while still being verifiable.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Register</h3>
            <p className="text-gray-600 text-sm">
              Create an account with your Ethereum wallet address
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Get Verified
            </h3>
            <p className="text-gray-600 text-sm">
              Admin verifies your eligibility to vote
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cast Vote</h3>
            <p className="text-gray-600 text-sm">
              Connect MetaMask and vote for your preferred candidate
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              View Results
            </h3>
            <p className="text-gray-600 text-sm">
              Check the results after the election ends
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Built With Modern Technology
        </h2>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">⛓️</div>
              <p className="font-semibold text-gray-900">Ethereum</p>
              <p className="text-sm text-gray-600">Blockchain</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📜</div>
              <p className="font-semibold text-gray-900">Solidity</p>
              <p className="text-sm text-gray-600">Smart Contracts</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⚛️</div>
              <p className="font-semibold text-gray-900">React</p>
              <p className="text-sm text-gray-600">Frontend</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🦊</div>
              <p className="font-semibold text-gray-900">MetaMask</p>
              <p className="text-sm text-gray-600">Wallet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white mb-8 opacity-90">
              Join us in revolutionizing the voting process with blockchain
              technology
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-200 font-bold text-lg shadow-xl"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
