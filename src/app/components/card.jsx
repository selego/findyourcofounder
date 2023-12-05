import Link from "next/link";
import { FaLinkedin } from "react-icons/fa6";
import { skillsColors } from "@/app/utils/constants";
import { CardModal } from "./card-modal";

export const Card = ({ user, showModal = true, onClick }) => {
  return (
    <div className="rounded-[20px] bg-card p-5 cursor-pointer w-[320px] max-w-[90vw] h-[350px] flex flex-col hover:shadow-card transition-shadow relative">
      <h2 className="text-center text-shadow lg:text-2xl text-xl">
        {user.first_name} {user.last_name}
        {user.linkedin && (
          <Link href={user.linkedin} target="_blank" className="lg:ml-4 ml-2.5">
            <FaLinkedin className="inline-block text-linkedIn" />
          </Link>
        )}
      </h2>

      <ul className="flex items-center pb-1 pt-4 gap-x-2 overflow-x-scroll masked-skills">
        {user.skills.map((skill) => (
          <li
            key={skill}
            className={`text-xs py-1 px-4 rounded-full 
              ${skillsColors[skill]}`}
          >
            {skill}
          </li>
        ))}
      </ul>

      <div className="flex flex-col lg:gap-y-12 gap-y-6 flex-1 overflow-hidden mask-desc">
        <div>
          <h3 className="opacity-50 lg:text-xs text-xxs">What motivates you</h3>
          <p className="text-xs lg:text-sm">&quot;{user.motivations}&quot;</p>
        </div>
        <div>
          <h3 className="opacity-50 lg:text-xs text-xxs">The ideal partner</h3>
          <p className="text-xs lg:text-sm">&quot;{user.partner}&quot;</p>
        </div>
        <div>
          <h3 className="opacity-50 lg:text-xs text-xxs">The dream business</h3>
          <p className="text-xs lg:text-sm">&quot;{user.business}&quot;</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 gap-6">
        <div className="overflow-hidden">
          <h5 className="text-sm whitespace-nowrap">City</h5>
          <p className="truncate text-yellow">{user.city}</p>
        </div>
        <div>
          <h5 className="text-sm whitespace-nowrap">Investment</h5>
          <p className="truncate text-yellow text-end">{user.invest} €</p>
        </div>
      </div>
      {showModal && <CardModal user={user} onClick={onClick} />}
    </div>
  );
};
