
import { Link } from "react-router-dom";

import { IntroCard } from "../../../components/layout";
import {CustomInput} from "../../../components/forms";


export default function LoginForm() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">


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
