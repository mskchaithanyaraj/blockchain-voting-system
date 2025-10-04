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
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${spinnerSize} mx-auto`}
      ></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
