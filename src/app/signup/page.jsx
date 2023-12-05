import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

import { ChomeurForm } from "./chomeur-form";
// import { ProjetForm } from "./projet-form";

export default async function Concept({ searchParams }) {
  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Register</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow">
            <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
            Back
          </Link>
          <Link href="/signin" className="inline-flex items-center my-4 gap-4 group hover:text-yellow">
            Already Registered ?
          </Link>
        </div>

        <div className={`mt-0 transition-all`}>
          {/* 
        <div
          className={`${!searchParams.type ? "mt-[20%]" : "mt-0"
            } transition-all`}
        > */}
          {/* {!searchParams.type && (
            <h3 className="text-center text-2xl mb-10">
              Quel est ton profil ?
            </h3>
          )} */}

          {/* <div className="flex items-center justify-center gap-x-6">
            <Link
              href="/inscription?type=chomeur"
              className={`block bg-gradient-gray px-6 lg:py-2.5 py-2 rounded-[20px] w-max hover:opacity-75 text-xs transition-all ${searchParams.type === "chomeur" ? "shadow-card" : ""
                }`}
            >
              Je suis chômeur !
            </Link>
            <Link
              href="/inscription?type=projet"
              className={`block bg-gradient-gray px-6 lg:py-2.5 py-2 rounded-[20px] w-max hover:opacity-75 text-xs transition-all ${searchParams.type === "projet" ? "shadow-card" : ""
                }`}
            >
              J'ai un projet !
            </Link>
          </div> */}
          <ChomeurForm />
          {/* 
          {searchParams.type === "chomeur" && <ChomeurForm />}
          {searchParams.type === "projet" && <ProjetForm />} */}
        </div>
      </main>
    </>
  );
}
