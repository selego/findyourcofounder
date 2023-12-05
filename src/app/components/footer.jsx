"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const Footer = () => {
  const pathname = usePathname();
  const footerMenu = [
    {
      name: "Legal Notices",
      href: "/legale",
    },
    {
      name: "Concept", href: "/concept",
    },
    {
      name: "GDPR", href: "/gdpr",
    },
  ];

  return (
    <footer className="mx-[5vw] p-12 mt-12 border-t border-white/50 hover:border-white transition-colors">
      <ul className="flex items-center justify-center gap-x-8">
        {footerMenu.map((item) => (
          <li
            key={item.name}
            className={`transition-colors ${pathname === item.href
              ? "text-white"
              : "text-white/50 hover:text-white"
              }`}
          >
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </footer>
  );
};
