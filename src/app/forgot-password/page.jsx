"use client";

import { httpService } from "@/services/httpService";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [hasSent, setHasSent] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const sendResetLink = async (e) => {
    e.preventDefault();
    try {
      const { ok } = await httpService.post("/forgot_password", { email });
      if (!ok) {
        setError("Error sending reset link");
        return;
      }
      setHasSent(true);
    } catch (e) {
      setError("Error sending reset link");
    }
  };

  if (hasSent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-center text-2xl font-bold">Reset link sent</h1>
        <p className="text-center text-sm my-6">
          Please check your email for the reset link. It may be in your spam folder.
        </p>
        <button
          className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs"
          onClick={() => router.push("/signin")}
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-center text-2xl font-bold mb-12">Forgot your password ?</h1>
      <form className="flex flex-col gap-12 max-w-[350px] sm:w-[400px] md:w-[550px] mx-auto">
        <div className="relative flex-1">
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className="peer w-full"
            required
          />
          <label
            htmlFor="email"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            Email*
          </label>
        </div>
        <button
          onClick={sendResetLink}
          className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs"
        >
          Send reset link
        </button>
        {error && <p className="text-center text-red-500">{error}</p>}
      </form>
    </div>
  );
}
