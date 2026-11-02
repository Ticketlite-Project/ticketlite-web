import "./AuthHeader.css";

interface AuthHeaderProps {
  activeTab?: "signup" | "login";
  onTabChange?: (tab: "signup" | "login") => void;
}

export default function AuthHeader({
  activeTab = "signup",
  onTabChange,
}: AuthHeaderProps) {
  return (
    <header className="auth-header">
      <div className="auth-brand">
        <span className="auth-logo" aria-hidden="true">
          T
        </span>

        <span className="auth-brand-name">TicketLite</span>
      </div>

      <nav className="auth-tabs" aria-label="Authentication">
        <button
          type="button"
          className={`auth-tab ${
            activeTab === "signup" ? "active" : ""
          }`}
          onClick={() => onTabChange?.("signup")}
        >
          Sign up
        </button>

        <button
          type="button"
          className={`auth-tab ${
            activeTab === "login" ? "active" : ""
          }`}
          onClick={() => onTabChange?.("login")}
        >
          Log in
        </button>
      </nav>
    </header>
  );
}