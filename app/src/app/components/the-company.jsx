// "The cofounder is the company" — dark ink section that follows the hero
// marquee. Stats are passed in (founderCount is real, the rest are curated
// placeholders that match the reference design).

export function TheCompany({ founderCount = 229 }) {
  const stats = [
    { value: founderCount, label: "founders in the index" },
    { value: "18", label: "companies formed in 2025" },
    { value: "€2.4M", label: "capital pledged for ventures" },
    { value: "6", label: "countries · one community" },
  ];

  return (
    <section className="bg-ink text-primary-ink px-10 py-20">
      <div className="max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-start">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
              The concept
            </div>
            <h2 className="font-display font-bold text-[48px] lg:text-[64px] leading-[1.02] tracking-[-0.035em] text-primary-ink m-0">
              The cofounder is the{" "}
              <span className="font-serif italic font-normal text-accent-2">
                company
              </span>
              .
            </h2>
          </div>
          <p className="text-[17px] leading-relaxed text-primary-ink/75 lg:pt-6">
            Most ideas pivot. Most markets shift. The one variable that holds
            steady is the person beside you. Find Your Cofounder is a curated
            index of people serious enough to put their name, city, and budget
            on the line.
          </p>
        </div>

        <div className="mt-16 pt-10 border-t border-primary-ink/15 grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display font-bold text-5xl lg:text-[64px] tracking-[-0.03em] text-primary-ink leading-none">
                {s.value}
              </div>
              <div className="mt-3 font-mono text-[11px] tracking-[0.18em] uppercase text-primary-ink/55">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
