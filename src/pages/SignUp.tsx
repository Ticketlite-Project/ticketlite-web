
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, X, Ticket, Info } from "lucide-react";
import { registerUser } from "../services/authService";


type AccountType = "attendee" | "organizer";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [accountType, setAccountType] =
    useState<AccountType>("attendee");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const nameParts = formData.fullName.trim().split(/\s+/);

    if (nameParts.length < 2) {
      setError("Please enter your first name and last name.");
      return;
    }

    const username = formData.email.trim().split("@")[0].toLowerCase();

    if (!username) {
      setError("Please enter a valid email address.");
      return;
    }

    const registrationData = {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(" "),
      username,
      email: formData.email.trim(),
      password: formData.password,
    };

    setLoading(true);

    try {
      const response = await registerUser(registrationData);

      setSuccess(
        response.message || "Your account has been created successfully."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
      });

    } catch (err: unknown) {
      const errorMessage = axiosErrorHasMessage(err);

      if (errorMessage) {
        setError(errorMessage);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");


  return (
    <div className="min-h-screen bg-white lg:flex lg:items-center lg:justify-center">

      {/* Desktop modal overlay */}
      <div className="min-h-screen w-full bg-white lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/90 lg:px-4 lg:py-6">

        {/* Modal */}
        <div className="relative min-h-screen w-full bg-white lg:min-h-0 lg:max-h-[95vh] lg:max-w-[420px] lg:overflow-y-auto lg:rounded-sm">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <Link to="/" className="flex items-center gap-3">
              <Ticket className="h-7 w-7 fill-[#83c52c] text-[#83c52c]" />
              <span className="text-xl font-bold text-[#00865a]">
                TicketLite
              </span>
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Close sign-up"
              className="text-gray-500 hover:text-gray-900"
            >
              <X size={23} />
            </button>
          </div>

          <div className="px-5 pb-8 pt-6">

            {/* Tabs */}
            <div className="mb-6 grid grid-cols-2 border-b border-gray-200">
              <div className="border-b-[3px] border-[#00865a] py-3 text-center font-semibold">
                Sign up
              </div>

              <Link
                to="/login"
                className="py-3 text-center font-semibold text-gray-500 hover:text-[#00865a]"
              >
                Log in
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="mb-1 text-[28px] font-bold tracking-tight">
                Create your account
              </h1>

              <p className="text-[15px] text-gray-500">
                {accountType === "attendee"
                  ? "Buy tickets and keep them all in one place."
                  : "Buy tickets and keep them all in one place."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Account type selection */}
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">
                  I want to:
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {/* Attendee */}
                  <button  
                    type="button"
                    onClick={() => { setActiveTab("buy");
                      setAccountType("attendee");
                      setError("");
                      setSuccess("");
                    }}
                    aria-pressed={accountType === "attendee"}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      accountType === "attendee"
                        ? "border-[#00865a] bg-[#effaf5]"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    

                    <span className="block font-semibold text-gray-900">
                      Buy tickets
                    </span>

                    <span className="mt-1 block text-xs text-gray-500">
                      Attendee account
                    </span>

                   
                  </button>

                  {/* Organizer */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("sell");
                      setAccountType("organizer");
                      setError("");
                      setSuccess("");
                    }}
                    aria-pressed={accountType === "organizer"}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      accountType === "organizer"
                        ? "border-[#00865a] bg-[#effaf5]"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    

                    <span className="block font-semibold text-gray-900">
                      Sell tickets
                    </span>

                    <span className="mt-1 block text-xs text-gray-500">
                      Organizer account
                    </span>

                  
                  </button>
                </div>

                
              </div>

              {/* Full name */}
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full rounded-sm border border-gray-300 px-3 py-3 outline-none focus:border-[#00865a] focus:ring-1 focus:ring-[#00865a]"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full rounded-sm border border-gray-300 px-3 py-3 outline-none focus:border-[#00865a] focus:ring-1 focus:ring-[#00865a]"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-sm border border-gray-300 px-3 py-3 pr-12 outline-none focus:border-[#00865a] focus:ring-1 focus:ring-[#00865a]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                  </button>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  At least 8 characters
                </p>

                 

    {activeTab === "sell" && (
  <div className="flex items-start gap-2 rounded-lg bg-lime-200 p-3 text-sm text-gray-900">
    <Info size={16} className="mt-0.5 shrink-0 text-emerald-700" />
    <p className="text-xs leading-relaxed">
      Organiser accounts are reviewed by our team. You can create draft
      events right away and publish once you're approved.
    </p>
  </div>
)}
              </div>

              {/* Messages */}
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-700" role="status">
                  {success}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#00865a] px-4 py-4 font-bold text-white transition-colors hover:bg-[#006f49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : accountType === "attendee"
                    ? "CREATE ATTENDEE ACCOUNT"
                    : "CREATE ORGANIZER ACCOUNT"}
              </button>
            </form>

            {/* Terms */}
            <p className="mt-5 text-center text-sm leading-6 text-gray-500">
              By signing up you agree to the{" "}
              <Link to="/terms" className="text-blue-600 underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-blue-600 underline">
                Privacy policy
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to extract API error messages
function axiosErrorHasMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;

    if (typeof response?.data?.message === "string") {
      return response.data.message;
    }
  }

  return null;
}

export default SignUp;
