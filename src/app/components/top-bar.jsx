"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export const TopBar = () => {
  const { status } = useSession();

  function renderButtons() {
    if (status === "authenticated") {
      return (
        <>
          <Link
            href="/profile"
            className="rounded-full px-4 py-1.5 bg-gradient-gray inline-block hover:opacity-75 transition-opacity"
          >
            Profile
          </Link>
          <div
            onClick={() => signOut()}
            className="cursor-pointer rounded-full px-4 py-1.5 bg-orange-400 inline-block hover:opacity-75 transition-opacity"
          >
            Sign Out
          </div>
        </>
      );
    }
    return (
      <>
        <Link
          href="/signin"
          className="rounded-full px-4 py-1.5 bg-gradient-gray inline-block hover:opacity-75 transition-opacity"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="rounded-full px-4 py-1.5 bg-orange-400 inline-block hover:opacity-75 transition-opacity"
        >
          Sign Up
        </Link>
      </>
    );
  }

  return (
    <nav className="flex items-center justify-between p-4 pb-6 lg:pb-7 lg:text-xs text-xxs">
      <Link href="/concept" className="hidden lg:inline lg:flex-1">
        What's the concept?
      </Link>
      <div className="space-x-2 lg:flex-1 flex justify-end">{renderButtons()}</div>
    </nav>
  );
};
