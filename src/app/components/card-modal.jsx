"use client";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import * as Dialog from "@radix-ui/react-dialog";

const { skillsColors } = require("@/app/utils/constants");

import api from "@/lib/api";
import { useRouter } from "next/navigation";

export const CardModal = ({ user }) => {
  const router = useRouter();

  async function handleModalOpen() {
    await api.post("/api/user/click", { id: user._id });
    router.refresh();
  }

  return (
    <Dialog.Root onOpenChange={(open) => open && handleModalOpen()}>
      <Dialog.Trigger asChild>
        <div className="bg-black/90 w-full h-full absolute top-0 left-0 rounded-[20px] flex items-center justify-center flex-col opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-5xl">{user.clicks}</p>
          <p className="text-sm">clics on this card</p>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/10 backdrop-blur-xl data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 min-h-[80vh] w-[70vw] h-[calc(100%_-_40px)] overflow-auto max-w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] shadow-card p-6 bg-card focus:outline-none">
          <Dialog.Close asChild>
            <div className="flex items-center justify-end">
              <button
                className="appearance-none hover:opacity-100 opacity-75 transition-opacity rounded-lg"
                aria-label="Close"
              >
                <FaXmark size={32} />
              </button>
            </div>
          </Dialog.Close>
          <h2 className="text-center text-shadow text-3xl">
            {user.first_name} {user.last_name}
            {user.linkedin && (
              <Link href={user.linkedin} target="_blank" className="ml-4">
                <FaLinkedin className="inline-block text-linkedIn" size={24} />
              </Link>
            )}
          </h2>

          <ul className="flex items-center pb-1 pt-4 gap-x-2 overflow-x-scroll masked-skills">
            {user.skills.map((skill) => (
              <li
                key={skill}
                className={`text-sm py-1 px-4 rounded-full 
              ${skillsColors[skill]}`}
              >
                {skill}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-y-12 flex-1 overflow-hidden py-4">
            <div>
              <h3 className="opacity-50">What motivates you</h3>
              <p className="break-all">&quot;{user.motivations}&quot;</p>
            </div>
            <div>
              <h3 className="opacity-50">The ideal business partner</h3>
              <p className="break-all">&quot;{user.partner}&quot;</p>
            </div>
            <div>
              <h3 className="opacity-50">The dream business</h3>
              <p className="break-all">&quot;{user.business}&quot;</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 gap-6">
            <div className="overflow-hidden">
              <h5 className="text-sm whitespace-nowrap">City</h5>
              <p className="truncate text-yellow">{user.city}</p>
            </div>
            <div>
              <h5 className="text-sm whitespace-nowrap">Investment amount</h5>
              <p className="truncate text-yellow text-end">{user.invest} €</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
