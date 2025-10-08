import { useEffect } from "react";

/**
 * Success Message Component
 * Displays success messages with dismiss functionality and optional auto-dismiss
 */
const SuccessMessage = ({
  message,
  onDismiss,
  autoDismiss = true,
  timeout = 5000,
}) => {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, timeout]);

  if (!message) return null;

  return (
    <div
      className="mb-6 rounded-lg p-4 animate-slide-in border backdrop-blur-sm transition-all duration-300"
      style={{
        backgroundColor: "var(--clr-success-surface)",
        borderColor: "var(--clr-success-border)",
      }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 transition-colors duration-300"
            style={{ color: "var(--clr-success-primary)" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p
            className="text-caption transition-colors duration-300"
            style={{ color: "var(--clr-success-text)" }}
          >
            {message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                color: "var(--clr-success-primary)",
                focusRingColor: "var(--clr-success-primary)",
                focusRingOffsetColor: "var(--clr-success-surface)",
              }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
