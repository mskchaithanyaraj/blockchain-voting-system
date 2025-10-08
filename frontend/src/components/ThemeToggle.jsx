import { useTheme } from "../context/ThemeContext";

/**
 * Theme Toggle Button Component
 * Provides a sleek toggle switch for dark/light mode
 */
const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-300 ease-in-out focus:outline-none
        focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
        ${
          isDark
            ? "bg-primary-a30 focus:ring-primary-a40"
            : "bg-surface-a30 focus:ring-primary-a20"
        }
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Toggle circle */}
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full
          transition-transform duration-300 ease-in-out
          ${
            isDark
              ? "translate-x-6 bg-primary-a0"
              : "translate-x-1 bg-surface-a0"
          }
          shadow-soft
        `}
      >
        {/* Icon inside the toggle */}
        <span className="flex h-full w-full items-center justify-center">
          {isDark ? (
            // Moon icon for dark mode
            <svg
              className="h-3 w-3 text-surface-a0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            // Sun icon for light mode
            <svg
              className="h-3 w-3 text-warning-a0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
