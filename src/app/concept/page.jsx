import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

export default async function Concept() {
  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Concept</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col gap-y-12">
        <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow">
          <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
          Back
        </Link>

        <article className="flex flex-col gap-y-12">
          <div className="space-y-4">
            <p>
              Our platform is dedicated to helping you find a Co-Founder who complements your skills. Whether you're a
              tech whiz, a marketing guru, or a creative spirit, here you can connect with someone whose expertise fills
              the gaps in your own.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl">How It Works</h2>
            <p>
              Sign up, describe your strengths, areas of expertise, and what you're looking for. Your profile will then
              appear on the homepage, making it easy for others to discover you and see how you can complement each
              other.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl">Stay Updated</h2>
            <p>
              With an account, you can track how many people are viewing your profile. Don’t forget to check back often.
              <br />A project that aligns with your skills and needs your expertise might just be around the corner.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl">Upcoming Features</h2>
            <p>
              We're always looking to enhance our platform. If you have suggestions or ideas, we'd love to hear them.
            </p>
            <p>
              <a href="mailto:sebastien@selego.co">sebastien@selego.co</a>
            </p>
          </div>
        </article>
      </main>
    </>
  );
}
