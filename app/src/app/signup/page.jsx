import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/app/components/auth-shell";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getLanguageAlternates } from "@/app/utils/constants";
import { ChomeurForm } from "./chomeur-form";

export const metadata = {
  title: "Join the index",
  description:
    "Add your founder card to the index. Tell us what you want to build, what you're great at, and the partner you're looking for.",
  alternates: { canonical: "/signup", languages: getLanguageAlternates("/signup") },
  openGraph: {
    title: "Join the index — findyourcofounder",
    description: "Add your founder card to the index and start meeting partners.",
    url: "/signup",
    type: "website",
  },
};

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
