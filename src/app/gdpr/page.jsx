import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default async function Concept() {
  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Personal data</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col gap-y-12">
        <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow">
          <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
          Back
        </Link>

        <article className="flex flex-col gap-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl">DPO</h2>
            <div>
              <h3 className="text-xl">Name</h3>
              <p>Le Goff Sebastien</p>
            </div>
            <div>
              <h3 className="text-xl">Mail</h3>
              <p>
                <a href="mailto:sebastien@selego.co">sebastien@selego.co</a>
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl">Data processing</h2>
            <div>
              <h3 className="text-xl">Purpose pursued</h3>
              <p>
                Present the information of the user on the website, in order to initiate a connection with Co-Founders.
              </p>
            </div>
            <div>
              <h3 className="text-xl">Legal basis justifying the processing</h3>
              <p>User consent to registration by means of a checkbox.</p>
            </div>
            <div>
              <h3 className="text-xl">Obligatory or optional nature of the collection of personal data</h3>
              <p>
                If the user refuses the collection of their data, their account will not be created, their data will not
                be recorded, and will therefore not be present on the site.
              </p>
            </div>
            <div>
              <h3 className="text-xl">Recipients of personal data</h3>
              <p>The user's data will be retained until their account is deleted.</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl">Internet user rights</h2>
            <div>
              <h3 className="text-xl">Managing your data</h3>
              <p>
                The user can delete their account as well as all their data from their account page , or simply modify
                part of their data.
              </p>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
