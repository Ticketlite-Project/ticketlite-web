import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, X, Ticket, Users } from "lucide-react";
import { loginUser } from "../services/authService";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);

    try {
      const response = await loginUser(formData);

      console.log("Login response:", response);

      // Check the actual Swagger response before storing a token.
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err !== null && "response" in err
          ? (err as {
              response?: { data?: { message?: string } };
            }).response?.data?.message
          : undefined;

      setError(message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:flex lg:items-center lg:justify-center">
      <div className="w-full min-h-screen bg-white lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/90 lg:px-4 lg:py-6">
        <div className="w-full min-h-screen bg-white lg:min-h-0 lg:max-w-[420px] lg:rounded-sm">

          <div className="flex items-center justify-between border-b px-6 py-5">
            <Link to="/" className="flex items-center gap-3">
              <Ticket className="h-7 w-7 fill-[#83c52c] text-[#83c52c]" />
              <span className="text-xl font-bold text-[#00865a]">
                TicketLite
              </span>
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Close login"
            >
              <X size={23} />
            </button>
          </div>

          <div className="px-5 pb-8 pt-6">
            <div className="mb-6 grid grid-cols-2 border-b">
              <Link
                to="/signup"
                className="py-3 text-center font-semibold text-gray-500"
              >
                Sign up
              </Link>

              <div className="border-b-[3px] border-[#00865a] py-3 text-center font-semibold">
                Log in
              </div>
            </div>

            <h1 className="mb-2 text-[28px] font-bold">
              Welcome back
            </h1>

            <p className="mb-6 text-gray-500">
              Log in to access your tickets.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm">
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="w-full rounded-sm border border-gray-300 px-3 py-3 outline-none focus:border-[#00865a] focus:ring-1 focus:ring-[#00865a]"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-sm border border-gray-300 px-3 py-3 pr-12 outline-none focus:border-[#00865a] focus:ring-1 focus:ring-[#00865a]"
                  />

                  <div className="flex justify-end pt-2">
  <Link
    to="/forgot-password"
    className="text-sm font-medium text-green-600 underline underline-offset-4 hover:text-blue-800 transition-colors"
  >
    Forgot password?
  </Link>
</div>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
                  </button>

                 
                </div>

                
              </div>



              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#00865a] px-4 py-4 font-bold text-white hover:bg-[#006f49] disabled:opacity-60"
              >
                {loading ? "LOGGING IN..." : "LOG IN"}
              </button>
            </form>

             <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-gray-900 mt-2">
  <Users
    size={16}
    className="mt-0.5 shrink-0 text-green-700"
  />

  <p className="text-xs leading-relaxed">
   Organisers, gate staff and admins use this same login. We’ll take you to the right place.
  </p>
</div>
          </div>
          <div className="mt-5 mb-2 text-center">
  <p className="text-sm text-gray-600">
    New to TicketLite? {" "}
    <Link
      to="/signup"
      className="font-semibold text-green-600 underline underline-offset-4 hover:text-blue-800 transition-colors mb-2"
    >
      Create an account
    </Link>
  </p>
</div>
        </div>
      </div>
    </div>
  );
};

export default Login;