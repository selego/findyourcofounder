"use client";

// "My profile" — auth-gated dashboard. Lets the signed-in user preview
// their own card, see stats, edit their profile, or delete their account.
// Re-skinned to the FYC palette; original data flow preserved.

import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import { Card } from "@/app/components/card";
import { httpService } from "@/services/httpService";
import { SKILL_TINT } from "@/app/utils/constants";

const SKILLS = ["Business", "Design", "Marketing", "Product", "Tech"];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const deleteAccount = async () => {
    if (!session?.user?._id) return;
    const confirm = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!confirm) return;
    await signOut({ callbackUrl: "/signin", redirect: true });
    const { ok } = await httpService.delete(`/${session.user._id}`);
    if (!ok) return;
    router.push("/signin");
  };

  const getProfile = async (userId) => {
    try {
      const { ok, user } = await httpService.get(`/${userId}`);
      if (!ok) return { ok, message: "User not found" };
      return { ok, user };
    } catch (error) {
      return { user: null, ok: false };
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (session && session.user) {
        const { ok, user } = await getProfile(session.user._id);
        if (ok && user) await update({ user });
      }
    };
    fetchProfile();
  }, [session?.user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status && !["authenticated", "loading"].includes(status)) return redirect("/");

  return (
    <main className="bg-bg min-h-screen pt-[112px] pb-16 px-6 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Top row — back link */}
        <div className="flex items-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-ink-2 hover:text-ink transition-colors group"
          >
            <FaArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to index</span>
          </Link>
        </div>

        {/* Greeting + card preview */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start mb-16">
          <div className="space-y-5">
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted">
              Your space
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl tracking-tight text-ink">
              Hey {session?.user?.first_name},{" "}
              <span className="font-serif italic font-normal text-accent">welcome back.</span>
            </h1>
            <h2 className="font-display font-bold text-2xl tracking-tight text-ink pt-4">
              Your card is live in the index
            </h2>
            <p className="text-ink-2 text-base leading-relaxed max-w-[520px]">
              Founders are browsing it right now. Keep your motivations sharp and your skills honest — the right cofounder is more likely to write you back when your card reads like a real person.
            </p>
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted">
              Hover to preview the back
            </div>
          </div>
          <div className="justify-self-center">
            {session?.user && <Card user={session.user} />}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl tracking-tight text-ink mb-6">Statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Clicks" value={session?.user?.clicks ?? 0} />
            <Stat label="LinkedIn" value="—" hint="coming soon" />
            <Stat label="Email" value="—" hint="coming soon" />
            <Stat label="Share" value="—" hint="coming soon" />
          </div>
        </section>

        {/* Edit form */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-2xl tracking-tight text-ink mb-6">Edit your profile</h2>
          <UserForm />
        </section>

        {/* Danger zone */}
        <section className="border-t border-rule pt-8">
          <h2 className="font-display font-bold text-lg tracking-tight text-ink mb-3">Danger zone</h2>
          <p className="text-sm text-ink-2 mb-5 max-w-[520px]">
            Deleting your account removes your card from the index immediately and can&apos;t be undone.
          </p>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-[1.5px] border-red-500 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-paper transition-colors"
            onClick={deleteAccount}
          >
            Delete my account
          </button>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="bg-paper rounded-2xl border border-rule p-5">
      <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </div>
      <div className="font-display font-bold text-4xl tracking-tight text-ink">{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}

const UserForm = () => {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [values, setValues] = useState({ skills: [] });
  const [errorSkills, setErrorSkills] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");

  useEffect(() => {
    if (user) setValues(user);
  }, [user]);

  const updateUserProfile = async (payload) => {
    const { ok } = await httpService.put(`/${payload._id}`, payload);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.skills?.length) {
      setErrorGeneral("Please select at least one skill.");
      return;
    }
    values._id = user._id;
    const ok = await updateUserProfile(values);
    if (!ok) {
      toast.error("Couldn't update your profile.");
      return;
    }
    await update({ user: values });
    toast.success("Profile updated.");
  };

  const handleSkillClick = (skill) => {
    const current = values.skills || [];
    const next = current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill];
    if (next.length > 3) {
      setErrorSkills("You can pick at most 3 skills.");
      return;
    }
    setErrorGeneral("");
    setErrorSkills("");
    setValues({ ...values, skills: next });
  };

  const handleInputChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <form className="space-y-8 bg-paper rounded-[22px] border border-rule p-8" onSubmit={handleSubmit}>
      <div>
        <Label>What are your skills? (pick up to 3)</Label>
        <div className="flex flex-wrap items-center gap-2">
          {SKILLS.map((skill) => {
            const active = (values?.skills || []).includes(skill);
            return (
              <button
                type="button"
                key={skill}
                className={`text-sm py-1.5 px-4 rounded-full border transition-all ${
                  active
                    ? `${SKILL_TINT[skill]} border-transparent`
                    : "bg-bg-soft text-ink-2 border-rule hover:border-ink"
                }`}
                onClick={() => handleSkillClick(skill)}
              >
                {skill}
              </button>
            );
          })}
        </div>
        {errorSkills && <p className="text-xs text-red-500 mt-2">{errorSkills}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First name" name="first_name" value={values.first_name} onChange={handleInputChange} required />
        <Field label="Last name" name="last_name" value={values.last_name} onChange={handleInputChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="City" name="city" value={values.city} onChange={handleInputChange} required />
        <Field
          label="LinkedIn"
          name="linkedin"
          type="url"
          value={values.linkedin}
          onChange={handleInputChange}
          pattern="(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/.+"
          required
        />
      </div>

      <Textarea
        label="What motivates you?"
        name="motivations"
        value={values.motivations}
        placeholder="The challenge, the desire to innovate…"
        onChange={handleInputChange}
      />
      <Textarea
        label="Your ideal partner?"
        name="partner"
        value={values.partner}
        placeholder="Someone who isn't afraid to get wet…"
        onChange={handleInputChange}
      />
      <Textarea
        label="Your dream business?"
        name="business"
        value={values.business}
        placeholder="A tech company with a revolutionary idea…"
        onChange={handleInputChange}
      />

      <div>
        <Label>How much can you invest?</Label>
        <input
          id="invest"
          name="invest"
          type="number"
          value={values.invest ?? ""}
          onChange={handleInputChange}
          min={0}
          max={1000000}
          required
        />
      </div>

      {errorGeneral && <p className="text-xs text-red-500">{errorGeneral}</p>}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-primary-ink text-sm font-semibold hover:bg-ink-2 transition-colors"
        >
          Update profile <span className="font-serif italic">→</span>
        </button>
      </div>
    </form>
  );
};

function Label({ children }) {
  return (
    <label className="block font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-3">
      {children}
    </label>
  );
}

function Field({ label, name, type = "text", ...rest }) {
  return (
    <div>
      <Label>{label}</Label>
      <input id={name} name={name} type={type} {...rest} />
    </div>
  );
}

function Textarea({ label, name, placeholder, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        id={name}
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={onChange}
        rows={4}
        minLength={10}
        maxLength={500}
        required
        className="w-full bg-paper text-ink border border-rule rounded-xl px-4 py-3.5 text-sm placeholder:text-muted focus:outline-none focus:border-ink resize-none transition-colors"
      />
    </div>
  );
}
