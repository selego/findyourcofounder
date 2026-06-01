"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const SearchBar = ({ total }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("search") || "";
  const [value, setValue] = useState(initial);
  const lastPushed = useRef(initial);

  useEffect(() => {
    if (value === lastPushed.current) return;
    const id = setTimeout(() => {
      lastPushed.current = value;
      router.push(value ? `?search=${encodeURIComponent(value)}` : "/");
    }, 250);
    return () => clearTimeout(id);
  }, [value, router]);

  return (
    <div className="relative shrink-0" role="search">
      <label htmlFor="founder-search" className="sr-only">
        Search founders by name, skill, or city
      </label>
      <input
        id="founder-search"
        type="search"
        placeholder={`Search ${total} founders…`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <FaMagnifyingGlass
        size={16}
        aria-hidden="true"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
    </div>
  );
};
