import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default async function Concept() {
  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Legal mention</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col gap-y-12">
        <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow">
          <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
          Back
        </Link>

        <article className="flex flex-col gap-y-12">
          {/* <div className="space-y-4">
            <h2 className="text-2xl">Company</h2>
            <div>
              <h3 className="text-xl">Nom - Prénom</h3>
              <p>Le Stud</p>
            </div>
            <div>
              <h3 className="text-xl">Adresse</h3>
              <p>23 rue de la Haute Guais - 35800 Dinard - France</p>
            </div>
            <div>
              <h3 className="text-xl">SIRET</h3>
              <p>83016706000029</p>
            </div>
          </div> */}
          <div className="space-y-4">
            <h2 className="text-2xl">Contact</h2>
            <div>
              <h3 className="text-xl">Mail</h3>
              <p>
                <a href="mailto:sebastien@selego.co">sebastien@selego.co</a>
              </p>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
