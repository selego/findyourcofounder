import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default async function Gdpr() {
  return (
    <main className="bg-bg min-h-screen pt-[140px] pb-24 px-6 lg:px-10">
      <div className="max-w-[760px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted hover:text-ink transition-colors mb-10 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>

        <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-accent mb-4">
          Privacy
        </div>
        <h1 className="font-display font-bold text-5xl lg:text-6xl tracking-[-0.035em] text-ink leading-[1.05] mb-12">
          Personal{" "}
          <span className="font-serif italic font-normal text-accent">data.</span>
        </h1>

        <article className="space-y-12 text-ink-2 text-[17px] leading-relaxed">
          <section className="space-y-6">
            <h2 className="font-display font-bold text-3xl tracking-tight text-ink">DPO</h2>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Name</h3>
              <p>Le Goff Sebastien</p>
            </div>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Mail</h3>
              <p>
                <a
                  href="mailto:sebastien@selego.co"
                  className="text-ink underline underline-offset-4 decoration-accent decoration-2 hover:text-accent transition-colors"
                >
                  sebastien@selego.co
                </a>
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-display font-bold text-3xl tracking-tight text-ink">Data processing</h2>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Purpose pursued</h3>
              <p>
                Present the information of the user on the website, in order to initiate a connection with Co-Founders.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Legal basis justifying the processing</h3>
              <p>User consent to registration by means of a checkbox.</p>
            </div>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Obligatory or optional nature of the collection of personal data</h3>
              <p>
                If the user refuses the collection of their data, their account will not be created, their data will not
                be recorded, and will therefore not be present on the site.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Recipients of personal data</h3>
              <p>The user&apos;s data will be retained until their account is deleted.</p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="font-display font-bold text-3xl tracking-tight text-ink">Internet user rights</h2>
            <div>
              <h3 className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-1">Managing your data</h3>
              <p>
                The user can delete their account as well as all their data from their account page, or simply modify
                part of their data.
              </p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
