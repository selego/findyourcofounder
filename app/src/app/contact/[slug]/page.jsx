import Link from "next/link";
import { FaArrowLeft, FaArrowRight, FaLinkedin } from "react-icons/fa6";
import { SKILL_TINT } from "@/app/utils/constants";
import { httpService } from "@/services/httpService";
import {
  FYCAvatar,
  tintForKey,
  AVATAR_KIND_KEYS,
} from "@/app/components/humaaans";
import { CoffeeBlock, ProfileClickPing } from "./profile-client";

// Deterministic avatar kind per user (same hash as the index card uses, so
// the same founder gets the same illustration everywhere).
function avatarKindFor(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 17 + key.charCodeAt(i)) | 0;
  return AVATAR_KIND_KEYS[Math.abs(hash) % AVATAR_KIND_KEYS.length];
}

const TINT_BG = {
  salmon: "bg-salmon",
  violet: "bg-violet",
  mustard: "bg-mustard",
  rose: "bg-rose",
  mint: "bg-mint",
  cobalt: "bg-cobalt",
};

const QUESTIONS = [
  { n: "01", label: "What motivates them", key: "motivations", tint: "bg-mint" },
  { n: "02", label: "The partner they want", key: "partner", tint: "bg-rose" },
  { n: "03", label: "The dream business", key: "business", tint: "bg-accent-2" },
];

function buildOpeners(data) {
  const out = [];
  if (data.motivations) {
    const snippet = data.motivations.replace(/\s+/g, " ").trim().slice(0, 70);
    out.push(`What you said about: “${snippet}…” — same.`);
  }
  if (data.city) {
    out.push(`I think I'm the partner you described. Coffee in ${data.city}?`);
  }
  if (data.business) {
    out.push("Your dream business overlaps with mine. 30 minutes?");
  }
  return out;
}

async function getAdjacent(slug) {
  try {
    const { ok, data } = await httpService.post("/search", { page: 1, per_page: 500 });
    if (!ok) return { prev: null, next: null };
    const list = data?.users || [];
    const idx = list.findIndex((u) => u.slug === slug);
    if (idx < 0) return { prev: null, next: null };
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx < list.length - 1 ? list[idx + 1] : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

export default async function Contact({ params }) {
  const { data } = await httpService.get(`/slug/${params.slug}`);
  if (!data) return <></>;

  const { prev, next } = await getAdjacent(params.slug);

  const key = data._id || data.slug || `${data.first_name}-${data.last_name}`;
  const tint = tintForKey(key);
  const kind = avatarKindFor(key);
  const fullName = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();
  const openers = buildOpeners(data);

  return (
    <main className="bg-bg min-h-screen pt-[112px] pb-24 px-6 lg:px-10">
      <ProfileClickPing user={data} />
      <div className="max-w-[1160px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors mb-8 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Back to the index
        </Link>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <article className="bg-paper rounded-[22px] border-[1.5px] border-ink shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_1.35fr]">
          {/* Left tinted column with avatar */}
          <div
            className={`relative ${TINT_BG[tint]} p-7 flex flex-col justify-end min-h-[360px] lg:min-h-[460px] border-b-[1.5px] lg:border-b-0 lg:border-r-[1.5px] border-ink`}
          >
            <div className="absolute top-6 left-7 font-mono text-[11px] tracking-[0.18em] uppercase text-ink/85">
              <div>{data.city || "—"}</div>
              {typeof data.clicks === "number" && (
                <div className="mt-1.5 text-ink/60">
                  {data.clicks} clicks this month
                </div>
              )}
            </div>
            <div className="flex justify-center items-end">
              <FYCAvatar kind={kind} color={tint} size={260} />
            </div>
          </div>

          {/* Right paper column with name + meta */}
          <div className="p-8 lg:p-10 flex flex-col">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Open to meeting
              </span>
              <span className="text-rule">·</span>
              <span>Responds within 48h</span>
            </div>

            <h1 className="font-display font-bold text-[44px] lg:text-[64px] tracking-[-0.04em] text-ink leading-[1] mt-5">
              {data.first_name}{" "}
              <span className="font-serif italic font-normal text-accent">
                {data.last_name}
              </span>
              {data.linkedin && (
                <Link
                  href={data.linkedin}
                  target="_blank"
                  className="ml-3 align-middle text-linkedIn hover:text-ink transition-colors inline-block"
                  aria-label={`${fullName} on LinkedIn`}
                >
                  <FaLinkedin size={26} />
                </Link>
              )}
            </h1>

            {data.skills?.length > 0 && (
              <ul className="flex flex-wrap gap-2 mt-6">
                {data.skills.map((skill) => (
                  <li
                    key={skill}
                    className={`text-xs font-medium py-1.5 px-3.5 rounded-full ${
                      SKILL_TINT[skill] || "bg-bg-soft text-ink-2 border border-rule"
                    }`}
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto pt-10 grid grid-cols-3 gap-5 border-t border-rule">
              <Meta label="City" value={data.city || "—"} />
              <Meta
                label="Willing to invest"
                value={typeof data.invest === "number" ? `€${data.invest}` : "—"}
                accent
              />
              <Meta
                label="Profile clicks"
                value={typeof data.clicks === "number" ? data.clicks : "—"}
              />
            </div>
          </div>
        </article>

        {/* ── Three questions ───────────────────────────────────────── */}
        <section className="mt-16">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-6">
            The three questions · in their own words
          </div>
          <div className="space-y-6">
            {QUESTIONS.map((q) => {
              const value = data[q.key];
              if (!value) return null;
              return (
                <article
                  key={q.n}
                  className="relative bg-paper rounded-[22px] border-[1.5px] border-ink p-7 pt-9 shadow-card"
                >
                  <div
                    className={`absolute -top-3 left-7 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] border-ink ${q.tint} font-mono text-[10.5px] tracking-[0.18em] uppercase text-ink`}
                  >
                    {q.n} · {q.label}
                  </div>
                  <p className="font-serif italic text-[19px] lg:text-[22px] leading-snug text-ink m-0">
                    &ldquo;{value}&rdquo;
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Send a coffee ─────────────────────────────────────────── */}
        <CoffeeBlock
          name={data.first_name}
          intro="Free to send. We don't intermediate — your note lands in their inbox. Be specific about what caught their eye."
          openers={openers}
        />

        {/* ── Prev / Next nav ───────────────────────────────────────── */}
        {(prev || next) && (
          <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            <NavCard direction="prev" user={prev} />
            <NavCard direction="next" user={next} />
          </nav>
        )}
      </div>
    </main>
  );
}

function Meta({ label, value, accent }) {
  return (
    <div className="min-w-0">
      <h5 className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted mb-1.5">
        {label}
      </h5>
      <p
        className={`truncate font-display font-bold text-2xl tracking-tight ${
          accent ? "text-accent" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function NavCard({ direction, user }) {
  if (!user) return <span aria-hidden="true" />;
  const isPrev = direction === "prev";
  const tint = tintForKey(user._id || user.slug || user.first_name || "x");
  const kind = avatarKindFor(user._id || user.slug || user.first_name || "x");

  return (
    <Link
      href={`/contact/${user.slug}`}
      className="group bg-paper rounded-[22px] border-[1.5px] border-ink p-5 flex items-center gap-4 hover:shadow-card transition-shadow no-underline"
    >
      {isPrev && (
        <div className={`w-14 h-14 rounded-2xl ${TINT_BG[tint]} grid place-items-end overflow-hidden shrink-0`}>
          <FYCAvatar kind={kind} color={tint} size={56} />
        </div>
      )}
      <div className={`flex-1 min-w-0 ${isPrev ? "" : "text-right"}`}>
        <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted mb-1 flex items-center gap-1.5"
          style={isPrev ? {} : { justifyContent: "flex-end" }}>
          {isPrev && <FaArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />}
          {isPrev ? "Previous" : "Next"}
          {!isPrev && <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />}
        </div>
        <div className="font-display font-bold text-base tracking-tight text-ink truncate">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-[11px] font-mono tracking-[0.14em] uppercase text-muted truncate mt-0.5">
          {(user.skills || []).join(" · ")}
          {user.city && ` · ${user.city}`}
        </div>
      </div>
      {!isPrev && (
        <div className={`w-14 h-14 rounded-2xl ${TINT_BG[tint]} grid place-items-end overflow-hidden shrink-0`}>
          <FYCAvatar kind={kind} color={tint} size={56} />
        </div>
      )}
    </Link>
  );
}
