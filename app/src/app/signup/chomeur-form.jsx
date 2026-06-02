"use client";

// Multi-step signup wizard.
// Step 1 — identity (name, email, password, city, linkedin)
// Step 2 — skills + investment
// Step 3 — the three questions + GDPR consent → submit
//
// On submit we hit POST /signup, then sign in with credentials and
// redirect to "/". Original validation + error codes preserved.

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { httpService } from "@/services/httpService";
import { SKILL_TINT } from "@/app/utils/constants";

const SKILLS = ["Business", "Design", "Marketing", "Product", "Tech"];

const STEPS = [
  { id: "identity", label: "Who you are" },
  { id: "skills", label: "What you bring" },
  { id: "story", label: "Why you're here" },
];

export const ChomeurForm = () => {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ skills: [] });
  const [errorSkills, setErrorSkills] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);

  const fireSignupStarted = () => {
    if (startedRef.current || typeof window === "undefined") return;
    startedRef.current = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "signup_started", inviter: ref || null });
  };

  const handleInputChange = (e) => {
    fireSignupStarted();
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSkillClick = (skill) => {
    fireSignupStarted();
    const next = values.skills.includes(skill)
      ? values.skills.filter((s) => s !== skill)
      : [...values.skills, skill];
    if (next.length > 3) {
      setErrorSkills("You can pick at most 3 skills.");
      return;
    }
    setErrorSkills("");
    setErrorGeneral("");
    setValues({ ...values, skills: next });
  };

  const goNext = (e) => {
    e?.preventDefault();
    if (step === 1 && !values.skills.length) {
      setErrorGeneral("Please select at least one skill.");
      return;
    }
    setErrorGeneral("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrorGeneral("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const signUp = async (userBody) => {
    const { code, ok } = await httpService.post("/signup", userBody);
    if (code === "PASSWORD_NOT_VALIDATED") return { ok, message: "Password not validated" };
    if (code === "USER_ALREADY_REGISTERED") return { ok, message: "An account with this email already exists." };
    if (!ok) return { ok: false, message: "We couldn't create your account. Try again." };
    return { ok: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.skills.length) {
      setErrorGeneral("Please select at least one skill.");
      return;
    }
    setSubmitting(true);
    const payload = ref ? { ...values, invited_by: ref } : values;
    const { ok, message } = await signUp(payload);
    if (!ok) {
      setErrorGeneral(message);
      setSubmitting(false);
      return;
    }
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "signup_submitted",
        skills: values.skills,
        city: values.city,
        invest: values.invest,
        inviter: ref || null,
      });
      if (ref) {
        window.dataLayer.push({ event: "invite_accepted", inviter: ref });
      }
    }
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: true,
      callbackUrl: "/welcome",
    });
  };

  return (
    <div>
      <StepIndicator step={step} />

      {step === 0 && (
        <StepIdentity values={values} onChange={handleInputChange} onNext={goNext} />
      )}
      {step === 1 && (
        <StepSkills
          values={values}
          onPick={handleSkillClick}
          onChange={handleInputChange}
          onBack={goBack}
          onNext={goNext}
          errorSkills={errorSkills}
        />
      )}
      {step === 2 && (
        <StepStory
          values={values}
          onChange={handleInputChange}
          onBack={goBack}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {errorGeneral && (
        <p className="text-sm text-red-500 mt-4">{errorGeneral}</p>
      )}
    </div>
  );
};

function StepIndicator({ step }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-3 flex-1">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center font-mono text-xs border-[1.5px] ${
              i <= step ? "bg-ink text-primary-ink border-ink" : "bg-paper text-muted border-rule"
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`font-mono text-[11px] tracking-[0.16em] uppercase ${
              i === step ? "text-ink" : "text-muted"
            }`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 ${i < step ? "bg-ink" : "bg-rule"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function StepIdentity({ values, onChange, onNext }) {
  return (
    <form className="space-y-5" onSubmit={onNext}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First name">
          <input
            name="first_name"
            type="text"
            value={values.first_name || ""}
            onChange={onChange}
            required
            pattern="[A-Za-zÜ-ü\s\-]{1,50}"
          />
        </Field>
        <Field label="Last name">
          <input
            name="last_name"
            type="text"
            value={values.last_name || ""}
            onChange={onChange}
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Email">
        <input
          name="email"
          type="email"
          value={values.email || ""}
          onChange={onChange}
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          value={values.password || ""}
          onChange={onChange}
          minLength={8}
          maxLength={50}
          autoComplete="new-password"
          required
        />
      </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="City">
          <input
            name="city"
            type="text"
            value={values.city || ""}
            onChange={onChange}
            pattern="[A-Za-zÜ-ü\s\-]{1,50}"
            required
          />
        </Field>
        <Field label="LinkedIn URL">
          <input
            name="linkedin"
            type="url"
            value={values.linkedin || ""}
            onChange={onChange}
            pattern="(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/.+"
            required
          />
        </Field>
      </div>

      <NavRow
        next="Continue"
        leading={
          <span className="text-sm text-ink-2">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-ink font-medium underline underline-offset-4 decoration-accent decoration-2"
            >
              Sign in
            </Link>
          </span>
        }
      />
    </form>
  );
}

function StepSkills({ values, onPick, onChange, onBack, onNext, errorSkills }) {
  return (
    <form className="space-y-8" onSubmit={onNext}>
      <div>
        <Field label="What are your skills? Pick up to 3.">
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {SKILLS.map((skill) => {
              const active = values.skills.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  className={`text-sm py-2 px-4 rounded-full border transition-all ${
                    active
                      ? `${SKILL_TINT[skill]} border-transparent`
                      : "bg-bg-soft text-ink-2 border-rule hover:border-ink"
                  }`}
                  onClick={() => onPick(skill)}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </Field>
        {errorSkills && <p className="text-xs text-red-500 mt-2">{errorSkills}</p>}
      </div>

      <Field label="How much can you invest? (€)">
        <input
          name="invest"
          type="number"
          value={values.invest ?? ""}
          onChange={onChange}
          min={0}
          max={1000000}
          required
        />
      </Field>

      <NavRow onBack={onBack} next="Continue" />
    </form>
  );
}

function StepStory({ values, onChange, onBack, onSubmit, submitting }) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Textarea
        label="What motivates you?"
        name="motivations"
        value={values.motivations}
        placeholder="The challenge, the desire to innovate…"
        onChange={onChange}
      />
      <Textarea
        label="Your ideal partner?"
        name="partner"
        value={values.partner}
        placeholder="Someone who isn't afraid to get wet…"
        onChange={onChange}
      />
      <Textarea
        label="Your dream business?"
        name="business"
        value={values.business}
        placeholder="A tech company with a revolutionary idea…"
        onChange={onChange}
      />
      <Textarea
        label="What's blocking you?"
        name="blocker"
        value={values.blocker}
        placeholder="Funding, technical skills, time, the right cofounder…"
        onChange={onChange}
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="gdpr"
          className="w-[18px] h-[18px] mt-0.5 accent-accent flex-shrink-0"
          required
        />
        <span className="text-sm text-ink-2">
          I accept{" "}
          <Link href="/gdpr" target="_blank" className="text-ink underline underline-offset-2 decoration-accent decoration-2">
            the processing of my personal data
          </Link>
          .
        </span>
      </label>

      <NavRow
        onBack={onBack}
        next={submitting ? "Creating your card…" : "Create my card"}
        nextDisabled={submitting}
        nextType="submit"
      />
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Textarea({ label, name, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-2">
        {label}
      </label>
      <textarea
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

function NavRow({ onBack, next, nextDisabled, nextType = "submit", leading }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border-[1.5px] border-ink text-ink text-sm font-medium hover:bg-ink hover:text-primary-ink transition-colors"
        >
          <span className="font-serif italic">←</span> Back
        </button>
      ) : leading ? (
        leading
      ) : (
        <span />
      )}
      <button
        type={nextType}
        disabled={nextDisabled}
        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-primary-ink text-sm font-semibold hover:bg-ink-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {next} <span className="font-serif italic">→</span>
      </button>
    </div>
  );
}
