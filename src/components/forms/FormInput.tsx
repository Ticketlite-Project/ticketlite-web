import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./FormInput.css";

interface FormInputProps {
  id: string;
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function FormInput({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = true,
  autoComplete,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>

      <div
        className={`form-input-wrapper ${
          error ? "has-error" : ""
        }`}
      >
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${id}-error`
              : hint
                ? `${id}-hint`
                : undefined
          }
          className="form-input"
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff size={20} strokeWidth={1.8} />
            ) : (
              <Eye size={20} strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          <span aria-hidden="true">ⓘ</span>
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${id}-hint`} className="form-hint">
          {hint}
        </p>
      )}
    </div>
  );
}