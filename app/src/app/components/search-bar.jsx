"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FaMagnifyingGlass } from "react-icons/fa6";

export const SearchBar = ({ users }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center justify-center flex-col gap-6">
      <div className="relative">
        <input
          type="search"
          placeholder={`Search in ${users.length} Co-Founders registered`}
          defaultValue={searchParams.get("search")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              router.push(`?search=${e.target.value}`);
            }
          }}
          onBlur={(e) => {
            if (e.target.value) {
              router.push(`?search=${e.target.value}`);
            } else {
              router.push("/");
            }
          }}
        />
        <FaMagnifyingGlass size={16} className="absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};
