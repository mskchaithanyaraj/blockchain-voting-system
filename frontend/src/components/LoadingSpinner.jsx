/**
 * Loading Spinner Component
 * Reusable loading indicator with customizable size and optional text
 */
const LoadingSpinner = ({ size = "medium", text = "", centered = true }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.medium;

  const content = (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full border-2 border-t-transparent ${spinnerSize} mx-auto transition-colors duration-300`}
        style={{ borderColor: "var(--clr-accent-primary)" }}
      ></div>
      {text && (
        <p
          className="mt-4 text-body-2 transition-colors duration-300"
          style={{ color: "var(--clr-text-secondary)" }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div
        className="flex items-center justify-center min-h-screen transition-colors duration-300"
        style={{ backgroundColor: "var(--clr-background-primary)" }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
