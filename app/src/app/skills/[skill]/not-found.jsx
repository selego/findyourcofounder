import Link from "next/link";
import { SKILL_TINT } from "@/app/utils/constants";

export const metadata = {
  title: "Skill not found",
  description: "That isn't one of the skill categories on findyourcofounder — pick one of the five below.",
  robots: { index: false, follow: true },
};

export default function SkillNotFound() {
  const skills = Object.keys(SKILL_TINT);
  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[760px] mx-auto text-center">
        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          Not a skill we track
        </div>
        <h1 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-ink m-0">
          Pick one of these{" "}
          <span className="font-serif italic font-normal text-accent">five</span>.
        </h1>
        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <li key={skill}>
              <Link
                href={`/skills/${skill.toLowerCase()}`}
                className={`inline-block text-sm font-medium py-2 px-4 rounded-full ${SKILL_TINT[skill]}`}
              >
                {skill}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-paper border-[1.5px] border-ink text-ink text-[13.5px] font-semibold hover:bg-bg-soft transition-colors"
          >
            Or browse the full index
          </Link>
        </div>
      </div>
    </main>
  );
}
