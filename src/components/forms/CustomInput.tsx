
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface CustomInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  error?: string;
}

export default function CustomInput({
  label,
  id,
  name,
  type = "text",
  error,
  required,
  className = "",
  ...inputProps
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id ?? name;
  const isPassword = type === "password";

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          {...inputProps}
          id={inputId}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full rounded-lg border bg-white px-4 py-3
            text-sm text-gray-900 placeholder:text-gray-400
            outline-none transition-all duration-200
            focus:ring-2
            ${
              error
                ? "border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-600 focus:ring-blue-100"
            }
            ${isPassword ? "pr-12" : ""}
            ${className}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
