import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

/**
 * Navigation Bar Component
 * Modern, sleek navbar with theme support and smooth animations
 * Features glass morphism design and mobile-first approach
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isVoter, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/candidates", label: "Candidates" },
    { path: "/admin/voters", label: "Voters" },
    { path: "/admin/election", label: "Election" },
  ];

  const voterLinks = [
    { path: "/voter/dashboard", label: "Dashboard" },
    { path: "/voter/vote", label: "Cast Vote" },
    { path: "/voter/results", label: "Results" },
  ];

  const links = isAdmin ? adminLinks : isVoter ? voterLinks : [];

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-theme
          backdrop-blur-lg border-b
          ${
            isDark
              ? "bg-surface-a0/80 border-surface-a20"
              : "bg-surface-a0/80 border-surface-a30"
          }
        `}
        style={{
          backgroundColor: isDark
            ? "rgba(5, 5, 5, 0.8)"
            : "rgba(255, 255, 255, 0.8)",
          borderBottomColor: isDark
            ? "var(--clr-surface-a20)"
            : "var(--clr-surface-a30)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                {/* Modern ballot icon */}
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110
                    ${
                      isDark
                        ? "bg-primary-a20 text-surface-a0"
                        : "bg-primary-a0 text-surface-a0"
                    }
                  `}
                  style={{
                    backgroundColor: isDark
                      ? "var(--clr-primary-a20)"
                      : "var(--clr-primary-a0)",
                    color: "var(--clr-surface-a0)",
                  }}
                >
                  <svg
                    className="w-5 h-5"
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
                <span
                  className={`
                    text-xl font-brand transition-colors duration-300
                    ${isDark ? "text-primary-a20" : "text-primary-a0"}
                  `}
                  style={{
                    color: isDark
                      ? "var(--clr-primary-a20)"
                      : "var(--clr-primary-a0)",
                  }}
                >
                  BallotX
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="flex items-center space-x-1">
                  {links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        relative overflow-hidden group
                        ${
                          isActivePath(link.path)
                            ? isDark
                              ? "bg-primary-a30 text-surface-a0"
                              : "bg-primary-a0 text-surface-a0"
                            : isDark
                            ? "text-text-primary hover:bg-surface-a20"
                            : "text-text-primary hover:bg-surface-a20"
                        }
                      `}
                      style={{
                        backgroundColor: isActivePath(link.path)
                          ? isDark
                            ? "var(--clr-primary-a30)"
                            : "var(--clr-primary-a0)"
                          : "transparent",
                        color: isActivePath(link.path)
                          ? "var(--clr-surface-a0)"
                          : "var(--clr-text-primary)",
                      }}
                    >
                      {link.label}
                      {/* Active indicator */}
                      {isActivePath(link.path) && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-0.5 animate-fade-in"
                          style={{
                            backgroundColor: isActivePath(link.path)
                              ? "var(--clr-text-inverse)"
                              : "var(--clr-text-primary)",
                          }}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div
                    className={`
                      px-3 py-2 rounded-lg transition-colors duration-300
                      ${isDark ? "bg-surface-a20" : "bg-surface-a20"}
                    `}
                    style={{
                      backgroundColor: isDark
                        ? "var(--clr-surface-a20)"
                        : "var(--clr-surface-a20)",
                    }}
                  >
                    <div className="text-sm">
                      <span
                        className="font-semibold"
                        style={{ color: "var(--clr-text-primary)" }}
                      >
                        {user?.name}
                      </span>
                      <span
                        className={`
                          ml-2 px-2 py-1 rounded text-xs font-medium
                          ${
                            isDark
                              ? "bg-primary-a30 text-surface-a0"
                              : "bg-primary-a0 text-surface-a0"
                          }
                        `}
                        style={{
                          backgroundColor: isDark
                            ? "var(--clr-primary-a30)"
                            : "var(--clr-primary-a0)",
                          color: "var(--clr-surface-a0)",
                        }}
                      >
                        {isAdmin ? "Admin" : "Voter"}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                      border hover:scale-105 focus-ring
                      ${
                        isDark
                          ? "border-danger-a0 text-danger-a0 hover:bg-danger-a0 hover:text-surface-a0"
                          : "border-danger-a0 text-danger-a0 hover:bg-danger-a0 hover:text-surface-a0"
                      }
                    `}
                    style={{
                      borderColor: "var(--clr-danger-a0)",
                      color: "var(--clr-danger-a0)",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                      hover:scale-105 focus-ring
                      ${
                        isDark
                          ? "text-text-primary hover:bg-surface-a20"
                          : "text-text-primary hover:bg-surface-a20"
                      }
                    `}
                    style={{
                      color: "var(--clr-text-primary)",
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                      hover:scale-105 focus-ring shadow-medium hover:shadow-heavy
                      ${
                        isDark
                          ? "bg-primary-a20 text-surface-a0"
                          : "bg-primary-a0 text-surface-a0"
                      }
                    `}
                    style={{
                      backgroundColor: isDark
                        ? "var(--clr-primary-a20)"
                        : "var(--clr-primary-a0)",
                      color: "var(--clr-surface-a0)",
                    }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`
                  p-2 rounded-lg transition-all duration-300 focus-ring
                  ${isDark ? "hover:bg-surface-a20" : "hover:bg-surface-a20"}
                `}
                style={{ color: "var(--clr-text-primary)" }}
              >
                <svg
                  className={`${
                    mobileMenuOpen ? "hidden" : "block"
                  } h-6 w-6 transition-transform`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <svg
                  className={`${
                    mobileMenuOpen ? "block" : "hidden"
                  } h-6 w-6 transition-transform`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={`
              absolute inset-0 transition-opacity duration-300
              ${isDark ? "bg-surface-a0/80" : "bg-surface-a0/80"}
            `}
            style={{
              backgroundColor: isDark
                ? "rgba(5, 5, 5, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            }}
          />
        </div>
      )}

      {/* Mobile menu panel */}
      <div
        className={`
          fixed top-16 left-0 right-0 z-50 transition-all duration-500 ease-in-out
          backdrop-blur-lg border-b shadow-heavy
          ${
            mobileMenuOpen
              ? "animate-slide-in-left"
              : "translate-x-full opacity-0"
          }
          ${
            isDark
              ? "bg-surface-a0/95 border-surface-a20"
              : "bg-surface-a0/95 border-surface-a30"
          }
          md:hidden
        `}
        style={{
          backgroundColor: isDark
            ? "rgba(5, 5, 5, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderBottomColor: isDark
            ? "var(--clr-surface-a20)"
            : "var(--clr-surface-a30)",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div className="px-4 py-6 space-y-4">
          {isAuthenticated ? (
            <>
              {/* Mobile Navigation Links */}
              {links.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300
                    ${
                      isActivePath(link.path)
                        ? isDark
                          ? "bg-primary-a30 text-surface-a0"
                          : "bg-primary-a0 text-surface-a0"
                        : isDark
                        ? "text-text-primary hover:bg-surface-a20"
                        : "text-text-primary hover:bg-surface-a20"
                    }
                  `}
                  style={{
                    backgroundColor: isActivePath(link.path)
                      ? isDark
                        ? "var(--clr-primary-a30)"
                        : "var(--clr-primary-a0)"
                      : "transparent",
                    color: isActivePath(link.path)
                      ? "var(--clr-surface-a0)"
                      : "var(--clr-text-primary)",
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div
                className="h-px my-4"
                style={{
                  backgroundColor: isDark
                    ? "var(--clr-surface-a20)"
                    : "var(--clr-surface-a30)",
                }}
              />

              {/* User Info */}
              <div
                className={`
                  px-4 py-3 rounded-lg
                  ${isDark ? "bg-surface-a20" : "bg-surface-a20"}
                `}
                style={{
                  backgroundColor: isDark
                    ? "var(--clr-surface-a20)"
                    : "var(--clr-surface-a20)",
                }}
              >
                <div
                  className="font-semibold text-base"
                  style={{ color: "var(--clr-text-primary)" }}
                >
                  {user?.name}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: "var(--clr-text-secondary)" }}
                >
                  {isAdmin ? "Administrator" : "Voter"}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-base font-medium
                  transition-all duration-300 border
                  ${
                    isDark
                      ? "border-danger-a0 text-danger-a0 hover:bg-danger-a0 hover:text-surface-a0"
                      : "border-danger-a0 text-danger-a0 hover:bg-danger-a0 hover:text-surface-a0"
                  }
                `}
                style={{
                  borderColor: "var(--clr-danger-a0)",
                  color: "var(--clr-danger-a0)",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300
                  ${
                    isDark
                      ? "text-text-primary hover:bg-surface-a20"
                      : "text-text-primary hover:bg-surface-a20"
                  }
                `}
                style={{ color: "var(--clr-text-primary)" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300
                  shadow-medium
                  ${
                    isDark
                      ? "bg-primary-a20 text-surface-a0"
                      : "bg-primary-a0 text-surface-a0"
                  }
                `}
                style={{
                  backgroundColor: isDark
                    ? "var(--clr-primary-a20)"
                    : "var(--clr-primary-a0)",
                  color: "var(--clr-surface-a0)",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;
