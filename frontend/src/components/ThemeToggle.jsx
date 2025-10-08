import { useTheme } from "../context/ThemeContext";

/**
 * Theme Toggle Button Component
 * Simple button to switch between dark/light mode
 */
const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 focus:ring-gray-500 text-gray-200"
            : "bg-gray-100 hover:bg-gray-200 focus:ring-gray-400 text-gray-800"
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        // Sun icon for switching to light mode
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for switching to dark mode
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
