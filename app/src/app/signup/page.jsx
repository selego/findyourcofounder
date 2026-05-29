import { AuthShell } from "@/app/components/auth-shell";
import { ChomeurForm } from "./chomeur-form";

export default async function SignUp() {
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
