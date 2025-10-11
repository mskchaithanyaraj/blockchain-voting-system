import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password Input Component with Show/Hide Toggle
 * Provides a password input field with toggle visibility functionality
 */
const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  required = false,
  className = "",
  style = {},
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`${className} pr-12`}
        style={style}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        className="absolute inset-y-0 right-0 flex items-center pr-4 transition-colors duration-200 hover:opacity-70 focus:outline-none"
        style={{ color: "var(--clr-text-muted)" }}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
