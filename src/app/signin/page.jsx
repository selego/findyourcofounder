"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function signInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Signin</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
        <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow mb-10">
          <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
          Back
        </Link>

        <div className="my-auto flex flex-col">
          <h3 className="text-center lg:text-xl text-base mb-10">Signin to update your information</h3>

          <div className="flex items-center justify-between gap-x-4 mb-6">
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
            <div className="relative flex-1">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                className="peer w-full"
                required
              />
              <label
                htmlFor="current-password"
                className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
              >
                Password*
              </label>
            </div>
          </div>

          <button
            onClick={() => signIn("credentials", { email, password, redirect: true, callbackUrl: "/profile" })}
            className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs"
          >
            Signin
          </button>

          <div className="flex items-center gap-x-6 justify-center lg:text-base text-sm">
            <Link href="/signup">Register</Link>
            <Link href="/forgot-password">Forget password ?</Link>
          </div>
        </div>
      </main>
    </>
  );
}
