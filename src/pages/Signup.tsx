import { useState } from "react";
import AuthHeader from "../components/layout/AuthHeader";
import FormInput from "../components/forms/FormInput";
import "./SignUp.css";

type AccountType = "attendee" | "organiser";
type AuthTab = "signup" | "login";

export default function SignUp() {
  const [activeTab, setActiveTab] = useState<AuthTab>("signup");

  const [accountType, setAccountType] =
    useState<AccountType>("attendee");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email =
        "Enter a full email address, like name@example.com";
    }

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const formData = {
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      accountType,
    };

    // Connect this to your registration API.
    // Never log or store plaintext passwords in production.
    console.log("Registration form validated", {
      fullName: formData.fullName,
      email: formData.email,
      accountType: formData.accountType,
    });
  }

  return (
    <main className="signup-page">
      <section className="signup-card">
        <AuthHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="signup-content">
          <h1>
            {activeTab === "signup"
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p className="signup-description">
            {activeTab === "signup"
              ? "Buy tickets and keep them all in one place."
              : "Log in to access your TicketLite account."}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {activeTab === "signup" && (
              <>
                <fieldset className="account-type-fieldset">
                  <legend>I want to</legend>

                  <div className="account-type-options">
                    <button
                      type="button"
                      className={`account-type-option ${
                        accountType === "attendee" ? "selected" : ""
                      }`}
                      onClick={() => setAccountType("attendee")}
                      aria-pressed={accountType === "attendee"}
                    >
                      <strong>Buy tickets</strong>
                      <span>Attendee account</span>
                    </button>

                    <button
                      type="button"
                      className={`account-type-option ${
                        accountType === "organiser" ? "selected" : ""
                      }`}
                      onClick={() => setAccountType("organiser")}
                      aria-pressed={accountType === "organiser"}
                    >
                      <strong>Sell tickets</strong>
                      <span>Organiser account</span>
                    </button>
                  </div>
                </fieldset>

                <FormInput
                  id="fullName"
                  name="fullName"
                  label="Full name"
                  placeholder="Ama Mensah"
                  value={fullName}
                  onChange={setFullName}
                  error={errors.fullName}
                  autoComplete="name"
                />
              </>
            )}

            <FormInput
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              autoComplete="email"
            />

            <FormInput
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              hint="At least 8 characters"
              autoComplete={
                activeTab === "signup"
                  ? "new-password"
                  : "current-password"
              }
            />

            <button type="submit" className="create-account-button">
              {activeTab === "signup" ? "CREATE ACCOUNT" : "LOG IN"}
            </button>
          </form>

          {activeTab === "signup" && (
            <p className="signup-terms">
              By signing up you agree to the{" "}
              <a href="/terms">Terms</a> and{" "}
              <a href="/privacy">Privacy policy</a>.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}