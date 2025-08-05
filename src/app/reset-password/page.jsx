"use client";

import { httpService } from "@/services/httpService";
import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    await httpService.post("/reset_password", { password });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-center text-2xl font-bold mb-12">Reset your password</h1>
      <form className="flex flex-col gap-12 max-w-[350px] sm:w-[400px] md:w-[550px] mx-auto">
        <div className="relative flex-1">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password"
            className="peer w-full"
            required
          />
          <label
            htmlFor="password"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            New password*
          </label>
        </div>
        <div className="relative flex-1">
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            type="password"
            className="peer w-full"
            required
          />
          <label
            htmlFor="confirmPassword"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            Confirm new password*
          </label>
        </div>
        <button
          disabled={!password || !confirmPassword || password !== confirmPassword}
          onClick={resetPassword}
          className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs"
        >
          Reset password
        </button>
      </form>
    </div>
  );
}
