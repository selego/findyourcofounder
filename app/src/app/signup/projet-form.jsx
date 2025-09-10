import Link from "next/link";

export const ProjetForm = () => {
  return (
    <form className="space-y-8">
      <>
        <h4 className="mt-6 mb-4 text-center">Quelles Skills ton associé doit posséder ?*</h4>
        <div className="flex items-center gap-x-2 justify-center mb-8">
          {["Business", "Design", "Marketing", "Product", "Tech"].map((skill) => (
            <button
              key={skill}
              className="text-xs bg-gradient-gray py-1 px-4 rounded-full hover:shadow-card transition-shadow"
            >
              {skill}
            </button>
          ))}
        </div>
      </>
      <fieldset className="p-4 pt-5 border border-white rounded-[10px] relative space-y-4">
        <p className="bg-black absolute left-4 -top-[12px]">Contact</p>
        <div className="flex items-center gap-x-4">
          <div className="relative flex-1">
            <input id="project-name" name="project-name" type="text" className="peer w-full" required />
            <label
              htmlFor="project-name"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Nom du projet*
            </label>
          </div>
          <div className="relative flex-1">
            <input id="email" name="email" type="email" className="peer w-full" required />
            <label
              htmlFor="email"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
              pattern="[A-Za-zÜ-ü\s\-]{1,50}"
            >
              Email
            </label>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="relative w-[60%]">
            <input id="lastName" name="lastName" type="text" className="peer w-full" required />
            <label
              htmlFor="lastName"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Nom*
            </label>
          </div>
          <div className="relative w-[60%]">
            <input id="firstName" name="firstName" type="text" className="peer w-full" required />
            <label
              htmlFor="firstName"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Prénom*
            </label>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="relative flex-1">
            <input
              id="zip-code"
              name="zip-code"
              type="number"
              className="peer w-full"
              required
              min={1000}
              max={97680}
            />
            <label
              htmlFor="zip-code"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Code Postal*
            </label>
          </div>
          <div className="relative w-[60%]">
            <input id="city" name="city" type="text" className="peer w-full" required pattern="[A-Za-zÜ-ü\s\-]{1,50}" />
            <label
              htmlFor="city"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Ville*
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
            />
            <label
              htmlFor="linkedin"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              LinkedIn*
            </label>
          </div>
          <div className="relative flex-1">
            <input
              id="phone"
              name="phone"
              type="number"
              className="peer w-full"
              pattern="([+][1-9]{2,3}[ .\-]?)?[0-9]{1,3}([ .\-]?[0-9]{2,3}){3,6}"
              required
            />
            <label
              htmlFor="phone"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Numéro de téléphone
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
            />
            <label
              htmlFor="password"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Mot de passe*
            </label>
          </div>
          <div className="relative flex-1">
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              className="peer w-full"
              required
              minLength={8}
              maxLength={50}
            />
            <label
              htmlFor="confirm-password"
              className="absolute lg:text-base text-sm left-4 top-1/2 -translate-y-9 text-red-500 transition-all text-yellow"
            >
              Confirmer*
            </label>
          </div>
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <label htmlFor="description" className="text-center block">
          Décris nous ton projet !*
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Mon projet révolutionnaire va changer le monde..."
          rows={5}
          minLength={10}
          maxLength={500}
          required
          className="w-full bg-black text-white bg-gradient-gray appearance-none px-4 lg:py-3.5 py-4 rounded-[20px] placeholder:opacity-50 text-xs lg:text-base outline-none focus:outline-red-500 resize-none"
        />
      </fieldset>
      <fieldset className="space-y-2">
        <label htmlFor="partner" className="text-center block">
          Quel est l'état d'esprit de ton futur associé ?*
        </label>
        <textarea
          name="partner"
          id="partner"
          placeholder="Temps plein ou temps partiel ? Vision long terme ou simple side project ? Forte implication dans la stratégie ou simple executant ?..."
          rows={5}
          minLength={10}
          maxLength={500}
          required
          className="w-full bg-black text-white bg-gradient-gray appearance-none px-4 lg:py-3.5 py-4 rounded-[20px] placeholder:opacity-50 text-xs lg:text-base outline-none focus:outline-red-500 resize-none"
        />
      </fieldset>
      <fieldset className="flex items-center justify-center gap-x-8">
        <h4>Combien tu peux investir ?</h4>
        <div className="relative w-full max-w-[250px]">
          <input id="invest" name="invest" type="number" className="w-full" min={0} max={1000000} required />
          <label htmlFor="invest" className="absolute lg:text-base left-4 top-1/2 -translate-y-10 text-yellow text-xs">
            Investissement
          </label>
        </div>
      </fieldset>
      <label htmlFor="checkbox" className="flex items-center justify-center gap-x-1">
        <input type="checkbox" id="checkbox" name="checkbox" className="w-[18px] h-[18px] accent-yellow" required />
        <p className="text-xs">
          Je souhaite être contacté par l'incubateur{" "}
          <Link href="https://www.redstart.fr/" target="_blank" className="underline">
            Redstart
          </Link>
        </p>

        <img
          src="https://cofondateurauchomage.fr/_next/image?url=%2Fassets%2Fredstart-logo.png&w=64&q=75"
          alt="redstart"
          width={25}
          height={25}
        />
      </label>
      <label htmlFor="checkbox" className="flex items-center justify-center gap-x-1">
        <input type="checkbox" id="checkbox" name="checkbox" className="w-[18px] h-[18px] accent-yellow" required />
        <p className="text-xs">
          J'accepte le{" "}
          <Link href="/donnees-personnelles" target="_blank" className="underline">
            traitement de mes données personnelles
          </Link>
        </p>
      </label>
      <div className="flex items-center justify-center">
        <button className="bg-gradient-gray px-12 lg:py-4 py-3 rounded-[20px] w-max mx-auto hover:opacity-75 transition-opacity mb-10 lg:text-base text-xs">
          M'inscrire
        </button>
      </div>
    </form>
  );
};
