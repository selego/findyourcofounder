"use client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { signOut, useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import { Card } from "@/app/components/card";
import { skillsColors } from "@/app/utils/constants";
import {accountingApi} from '@/app/api/accounting.api';
import { httpService } from "@/services/httpService";

export default function Concept() {
  const { data: session, status, update } = useSession();

  useEffect(() => {
   const fetchProfile = async () => {
      if (session && session.user) {
        const userId = session.user._id;
        const { ok, user } = await accountingApi.getProfile(userId);
        if (ok) {
          await update({ user });
        } else {
          console.error("Failed to fetch profile");
        }
      }
    };

    fetchProfile();
  }, [session]);

  if (status && !["authenticated", "loading"].includes(status)) return redirect("/");

  return (
    <>
      <header className="pb-9">
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow">Hola {session?.user?.first_name}</h1>
      </header>
      <main className="max-w-[750px] w-full mx-auto flex flex-col min-h-[calc(100vh-12rem)]">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center my-4 gap-4 group hover:text-yellow mb-10">
            <FaArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
            Back
          </Link>
          <button
            onClick={() =>
              signOut({
                callbackUrl: "/signin",
                redirect: true,
              })
            }
            className="rounded-full text-sm px-4 py-1.5 bg-gradient-gray inline-block hover:opacity-75 transition-opacity"
          >
            Sign Out
          </button>
        </div>

        <div className="flex items-center justify-between space-x-10">
          <div className="text-white">
            <h4 className="text-xl font-bold mb-3">Here is your card ✨</h4>
            <p>It is present on the home page, you should soon receive project proposals!</p>
          </div>
          <div className="">
            <Card user={session?.user} showModal={false} />
          </div>
        </div>
        <div className="py-14">
          <h2 className="text-white text-center text-xl font-bold mb-10">Statistics</h2>
          <div className="flex flex-col lg:flex-row gap-10 justify-between text-center">
            <div>
              <h4 className="text-base font-bold mb-3">Clicks</h4>
              <p className="text-4xl font-bold">{session?.user?.clicks}</p>
            </div>
            <div>
              <h4 className="text-base font-bold mb-3">Linkedin</h4>
              <p className="text-4xl font-bold">coming soon</p>
            </div>
            <div>
              <h4 className="text-base font-bold mb-3">Email</h4>
              <p className="text-4xl font-bold">coming soon</p>
            </div>
            <div>
              <h4 className="text-base font-bold mb-3">Share</h4>
              <p className="text-4xl font-bold">coming soon</p>
            </div>
          </div>
        </div>
        <div className="py-14">
          <h2 className="text-white text-center text-xl font-bold mb-10">Update</h2>
          <UserForm />
        </div>
      </main>
    </>
  );
}

const UserForm = () => {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [values, setValues] = useState({ skills: [] });
  const [errorSkills, setErrorSkills] = useState(``);
  const [errorGeneral, setErrorGeneral] = useState(``);

  useEffect(() => {
    setValues(user);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.skills.length) return setErrorGeneral("Please select at least one skill.");
    values._id = user._id;
    await accountingApi.updateUserProfile(values);
    await update({ user: values });
    toast.success("Your profile has been updated !");
  };

  const handleSkillClick = (skill) => {
    const skills = values.skills.includes(skill) ? values.skills.filter((s) => s !== skill) : [...values.skills, skill];
    if (skills.length > 3) return setErrorSkills(`You cannot select more than 3 skills.`);
    setErrorGeneral(``);
    setErrorSkills(``);
    setValues({ ...values, skills });
  };

  const handleInputChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <>
        <h4 className="mt-6 mb-4 text-center">What are your skills?*</h4>
        <div className="flex items-center gap-x-2 justify-center mb-8">
          {["Business", "Design", "Marketing", "Product", "Tech"].map((skill) => (
            <button
              type="button"
              key={skill}
              className={`text-xs  py-1 px-4 rounded-full hover:shadow-card transition-shadow  ${
                (values?.skills || []).includes(skill) ? skillsColors[skill] : "bg-gradient-gray"
              }`}
              onClick={() => handleSkillClick(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
        {errorSkills && <p className="text-xs text-red-500 text-center">{errorSkills}</p>}
      </>
      <div className="flex items-center gap-x-4">
        <div className="relative flex-1">
          <input
            id="last-name"
            value={values.last_name}
            name="last_name"
            type="text"
            className="peer w-full"
            required
            onChange={handleInputChange}
          />
          <label
            htmlFor="last-name"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            Last name*
          </label>
        </div>
        <div className="relative flex-1">
          <input
            id="first-name"
            value={values.first_name}
            name="first_name"
            type="text"
            className="peer w-full"
            required
            onChange={handleInputChange}
          />
          <label
            htmlFor="first-name"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            pattern="[A-Za-zÜ-ü\s\-]{1,50}"
          >
            First name*
          </label>
        </div>
      </div>

      <div className="flex items-center gap-x-4">
        <div className="relative w-[60%]">
          <input
            id="city"
            value={values.city}
            name="city"
            type="text"
            className="peer w-full"
            required
            pattern="[A-Za-zÜ-ü\s\-]{1,50}"
            onChange={handleInputChange}
          />
          <label
            htmlFor="city"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            City*
          </label>
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="relative w-[60%]">
          <input
            id="linkedin"
            value={values.linkedin}
            name="linkedin"
            type="url"
            className="peer w-full"
            required
            pattern="(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/.+"
            onChange={handleInputChange}
          />
          <label
            htmlFor="linkedin"
            className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
          >
            LinkedIn*
          </label>
        </div>
      </div>
      <fieldset className="space-y-2">
        <label htmlFor="motivations" className="text-center block">
          What motivates you?*
        </label>
        <textarea
          name="motivations"
          id="motivations"
          value={values.motivations}
          placeholder="The challenge, the desire to innovate..."
          rows={5}
          onChange={handleInputChange}
          minLength={10}
          maxLength={500}
          required
          className="w-full bg-black text-white bg-gradient-gray appearance-none px-4 lg:py-3.5 py-4 rounded-[20px] placeholder:opacity-50 text-xs lg:text-base outline-none focus:outline-red-500 resize-none"
        />
      </fieldset>
      <fieldset className="space-y-2">
        <label htmlFor="partner" className="text-center block">
          Your ideal partner?*
        </label>
        <textarea
          name="partner"
          id="partner"
          value={values.partner}
          onChange={handleInputChange}
          placeholder="Someone who isn't afraid to get wet, who has a head on their shoulders..."
          rows={5}
          minLength={10}
          maxLength={500}
          required
          className="w-full bg-black text-white bg-gradient-gray appearance-none px-4 lg:py-3.5 py-4 rounded-[20px] placeholder:opacity-50 text-xs lg:text-base outline-none focus:outline-red-500 resize-none"
        />
      </fieldset>
      <fieldset className="space-y-2">
        <label htmlFor="business" className="text-center block">
          Your dream business?*
        </label>
        <textarea
          name="business"
          id="business"
          value={values.business}
          onChange={handleInputChange}
          placeholder="A tech company, with a revolutionary idea..."
          rows={5}
          minLength={10}
          maxLength={500}
          required
          className="w-full bg-black text-white bg-gradient-gray appearance-none px-4 lg:py-3.5 py-4 rounded-[20px] placeholder:opacity-50 text-xs lg:text-base outline-none focus:outline-red-500 resize-none"
        />
      </fieldset>
      <fieldset className="flex items-center justify-center gap-x-8">
        <h4>How much can you invest?</h4>
        <div className="relative w-full max-w-[250px]">
          <input
            id="invest"
            value={values.invest}
            name="invest"
            type="number"
            className="w-full"
            min={0}
            max={1000000}
            required
            onChange={handleInputChange}
          />
          <label htmlFor="invest" className="absolute lg:text-base left-4 top-1/2 -translate-y-10 text-yellow text-xs">
            Investment
          </label>
        </div>
      </fieldset>

      <p className="text-xs text-red-500 text-center">{errorGeneral}</p>
      <div className="flex items-center justify-center">
        <button className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs">
          Update
        </button>
      </div>
    </form>
  );
};
