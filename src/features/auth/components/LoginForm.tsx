
import { Link } from "react-router-dom";
//import { Ticket } from "lucide-react";

import { IntroCard } from "../../../components/layout";
import CustomInput from "../../../components/forms/CustomInput";

export default function LoginForm() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Ticketlite Branding */}
        {/* <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <Ticket size={24} />
          </div>

          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Ticket<span className="text-blue-600">lite</span>
          </span>
        </div> */}

        {/* Login Card */}
        <IntroCard
          title="Welcome Back"
          description="Sign in to your Ticketlite account to continue."
        >
          <form className="space-y-6">

            {/* Email Address */}
            <CustomInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />

            {/* Password */}
            <CustomInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>

          </form>
        </IntroCard>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Ticketlite. All rights reserved.
        </p>

      </div>
    </main>
  );
}
