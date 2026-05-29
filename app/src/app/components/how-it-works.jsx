// "How it works" — three illustrated steps. Pure server component.

import { StepProfile, StepBrowse, StepMatch } from "./humaaans/scenes";

const STEPS = [
  {
    n: "01",
    title: "Write your profile",
    body: "Three questions. What motivates you, what kind of partner you want, the dream business you'd build. No buzzwords. Six minutes.",
    Illu: StepProfile,
    tint: "bg-mint",
  },
  {
    n: "02",
    title: "Browse the index",
    body: "Filter by skills, sector, city, or capital. Read what drives every founder before you ever send a message.",
    Illu: StepBrowse,
    tint: "bg-accent-2",
  },
  {
    n: "03",
    title: "Meet for coffee",
    body: "Send a note, set a coffee, see if it clicks. We charge nothing to write. The hard part is the conversation.",
    Illu: StepMatch,
    tint: "bg-rose",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-bg-soft px-10 py-28">
      <div className="max-w-[1320px] mx-auto">
        <div className="max-w-[800px] mb-14">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
            How it works
          </div>
          <h2 className="font-display font-bold text-[56px] lg:text-[64px] leading-[1] tracking-[-0.035em] text-ink m-0">
            Three steps.{" "}
            <span className="font-serif italic font-normal">Roughly</span> ten minutes.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {STEPS.map((s) => (
            <article
              key={s.n}
              className="bg-paper rounded-[22px] border-[1.5px] border-ink p-7 flex flex-col gap-5 shadow-card"
            >
              <div className={`${s.tint} aspect-[22/18] rounded-2xl p-4 border-[1.5px] border-ink`}>
                <s.Illu />
              </div>
              <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted">
                Step {s.n}
              </div>
              <h3 className="font-display font-bold text-2xl tracking-tight text-ink m-0">{s.title}</h3>
              <p className="text-base leading-relaxed text-ink-2 m-0">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
