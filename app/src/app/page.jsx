import Link from "next/link";
import { SearchBar } from "@/app/components/search-bar";
import { Card } from "@/app/components/card";
import { httpService } from "@/services/httpService";
import { PaginationWrapper } from "@/app/components/ui/pagination";

export default async function Home({ searchParams }) {
  const currentPage = parseInt(searchParams.page) || 1;
  const itemsPerPage = 16;

  const getUsers = async () => {
    try {
      const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`, {
        search: searchParams.search,
        page: currentPage,
        per_page: itemsPerPage,
      });
      if (!ok) return { message: "Error fetching users", users: [], total: 0 };
      return { users: data.users, total: data.total };
    } catch (e) {
      return { users: [], total: 0 };
    }
  };
  const { users, total } = await getUsers();

  return (
    <main className="bg-bg min-h-screen pt-[100px] pb-24 px-6 lg:px-10">
      <section className="max-w-[1320px] mx-auto">
        <div className="mb-5">
          <div className="font-mono text-[11.5px] tracking-[0.18em] uppercase text-muted mb-4">
            The index · updated daily ·{" "}
            <Link
              href="/concept"
              className="underline underline-offset-4 decoration-accent decoration-[1.5px] hover:text-ink transition-colors"
            >
              read the concept
            </Link>
          </div>
          <h1 className="font-display font-bold text-[56px] lg:text-[72px] leading-[0.98] tracking-[-0.035em] text-ink m-0 ">
            {total} founders{" "}
            <span className="font-serif italic font-normal text-accent">open</span> to meeting you.
          </h1>
        </div>

        <div className="mb-10 flex">
          <SearchBar users={users} total={total} />
        </div>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {users.map((user, i) => (
              <Card user={user} idx={(currentPage - 1) * itemsPerPage + i} key={user._id || i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted mt-8 font-serif italic text-lg">
            {searchParams.search
              ? "No founders matched that search yet."
              : "No founders to show — try again in a moment."}
          </p>
        )}

        <div className="mt-14">
          <PaginationWrapper currentPage={currentPage} totalItems={total} itemsPerPage={itemsPerPage} />
        </div>
      </section>
    </main>
  );
}
