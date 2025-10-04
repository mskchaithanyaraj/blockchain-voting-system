import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Navigation Bar Component
 * Displays navigation links based on user role (admin/voter)
 * Includes logout functionality and mobile responsive menu
 */
const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isVoter, logout } = useAuth();
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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-white"
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
              <span className="text-white text-xl font-bold">
                Blockchain Voting
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActivePath(link.path)
                        ? "bg-white bg-opacity-20 text-white"
                        : "text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Info & Logout */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-white text-sm">
                <span className="font-semibold">{user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                  {isAdmin ? "Admin" : "Voter"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold text-sm"
              >
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition duration-200 font-semibold text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition duration-200 font-semibold text-sm"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 focus:outline-none"
            >
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
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
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActivePath(link.path)
                        ? "bg-white bg-opacity-20 text-white"
                        : "text-white hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-white border-opacity-20 my-2"></div>
                <div className="px-3 py-2 text-white text-sm">
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {isAdmin ? "Administrator" : "Voter"}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white hover:bg-opacity-10"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
