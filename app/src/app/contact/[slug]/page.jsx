import Link from "next/link";
import { FaLinkedin } from "react-icons/fa6";
import { skillsColors } from "@/app/utils/constants";
import { httpService } from "@/services/httpService";

export default async function Contact({ params }) {
  const { ok, data } = await httpService.get(`/slug/${params.slug}`);
  if (!data) return <></>;

  return (
    <>
      <main className="max-w-[750px] w-full mx-auto flex flex-col gap-y-12">
        <article className="flex flex-col gap-y-12">
          <h1 className="text-center text-shadow lg:text-2xl text-xl">
            {data.first_name} {data.last_name}
            {data.linkedin && (
              <Link href={data.linkedin} target="_blank" className="lg:ml-4 ml-2.5">
                <FaLinkedin className="inline-block text-linkedIn" />
              </Link>
            )}
          </h1>

          <ul className="flex items-center pb-1 pt-4 gap-x-2 overflow-x-scroll masked-skills">
            {data.skills?.map((skill) => (
              <li
                key={skill}
                className={`text-xs py-1 px-4 rounded-full 
              ${skillsColors[skill]}`}
              >
                {skill}
              </li>
            ))}
          </ul>

          <div className="flex flex-col lg:gap-y-12 gap-y-6 flex-1 overflow-hidden">
            <div>
              <h3 className="opacity-50 lg:text-xs text-xxs">What motivates you</h3>
              <p className="text-xs lg:text-sm">&quot;{data.motivations}&quot;</p>
            </div>
            <div>
              <h3 className="opacity-50 lg:text-xs text-xxs">The ideal partner</h3>
              <p className="text-xs lg:text-sm">&quot;{data.partner}&quot;</p>
            </div>
            <div>
              <h3 className="opacity-50 lg:text-xs text-xxs">The dream business</h3>
              <p className="text-xs lg:text-sm">&quot;{data.business}&quot;</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-6">
            <div className="overflow-hidden">
              <h5 className="text-sm whitespace-nowrap">City</h5>
              <p className="truncate text-yellow">{data.city}</p>
            </div>
            <div>
              <h5 className="text-sm whitespace-nowrap">Investment</h5>
              <p className="truncate text-yellow text-end">{data.invest} €</p>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
