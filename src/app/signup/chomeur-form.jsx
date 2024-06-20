"use client";

import { useState } from "react";
import Link from "next/link";
import { configuredUrlForNoCashing, skillsColors } from "@/app/utils/constants";
import { signIn } from "next-auth/react";
import { httpService } from "@/services/httpService";

export const ChomeurForm = () => {
  const [values, setValues] = useState({ skills: [] });
  const [errorSkills, setErrorSkills] = useState(``);
  const [errorGeneral, setErrorGeneral] = useState(``);

  const signUp = async (userBody) => {
    const { user, token, ok, code } = await httpService.post('/signup', userBody);
    if (code === "PASSWORD_NOT_VALIDATED") return { ok, message: "Password not validated" };
    if (code === "USER_ALREADY_REGISTERED") return { ok, message: "User already registered" };
    if (!ok) return { ok: false, message: "User not created" };
    return { ok: true, message: "User created" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.skills.length) return setErrorGeneral("Please select at least one skill.");
    const { data, ok, message } = await signUp(values);
    if (!ok) return setErrorGeneral(message);
    signIn("credentials", { email: values.email, password: values.password, redirect: true, callbackUrl: "/" });
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
                values.skills.includes(skill) ? skillsColors[skill] : "bg-gradient-gray"
              }`}
              onClick={() => handleSkillClick(skill)}
            >
              {skill}
            </button>
          ))}
        </div>
        {errorSkills && <p className="text-xs text-red-500 text-center">{errorSkills}</p>}
      </>
      <fieldset className="p-4 pt-5 border border-white rounded-[10px] relative space-y-4">
        <p className="bg-black absolute left-4 -top-[12px]">Contact</p>
        <div className="flex items-center gap-x-4">
          <div className="relative flex-1">
            <input
              id="last-name"
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
            <input id="email" name="email" type="email" className="peer w-full" required onChange={handleInputChange} />
            <label
              htmlFor="email"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Email*
            </label>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="relative w-[60%]">
            <input
              id="city"
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
        <div className="flex items-center gap-x-4">
          <div className="relative flex-1">
            <input
              id="password"
              name="password"
              type="password"
              className="peer w-full"
              required
              minLength={8}
              maxLength={50}
              onChange={handleInputChange}
            />
            <label
              htmlFor="password"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Password*
            </label>
          </div>
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <label htmlFor="motivations" className="text-center block">
          What motivates you?*
        </label>
        <textarea
          name="motivations"
          id="motivations"
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
      <label htmlFor="checkbox" className="flex items-center justify-center gap-x-1">
        <input
          type="checkbox"
          id="checkbox"
          name="gdpr"
          className="w-[18px] h-[18px] accent-yellow"
          required
          // checked={values.gdpr}
          // onChange={() => handleInputChange({ target: { name: 'gdpr', value: !values.gdpr } })}
        />
        <p className="text-xs">
          I accept{" "}
          <Link href="/gdpr" target="_blank" className="underline">
            the processing of my personal data
          </Link>
        </p>
      </label>
      <p className="text-xs text-red-500 text-center">{errorGeneral}</p>
      <div className="flex items-center justify-center">
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs"
        >
          Register
        </button>
      </div>
    </form>
  );
};
