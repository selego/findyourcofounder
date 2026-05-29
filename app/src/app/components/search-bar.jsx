"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const SearchBar = ({ total }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="relative shrink-0">
      <input
        type="search"
        placeholder={`Search ${total} founders…`}
        defaultValue={searchParams.get("search") || ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = e.target.value;
            router.push(v ? `?search=${encodeURIComponent(v)}` : "/");
          }
        }}
        onBlur={(e) => {
          const v = e.target.value;
          if (v) router.push(`?search=${encodeURIComponent(v)}`);
          else if (searchParams.get("search")) router.push("/");
        }}
      />
      <FaMagnifyingGlass
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
      />
    </div>
  );
};
