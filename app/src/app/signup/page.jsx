import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/app/components/auth-shell";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ChomeurForm } from "./chomeur-form";

export default async function SignUp() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/profile");

  return (
    <AuthShell
      side="signup"
      kicker="Create your card"
      title={
        <>
          Join the{" "}
          <span className="font-serif italic font-normal text-accent">index.</span>
        </>
      }
    >
      <ChomeurForm />
    </AuthShell>
  );
}
