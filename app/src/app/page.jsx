import { SearchBar } from "@/app/components/search-bar";
import { Card } from "@/app/components/card";
import { httpService } from "@/services/httpService";
import { PaginationWrapper } from "@/app/components/ui/pagination";

export default async function Home({ searchParams }) {
  const currentPage = parseInt(searchParams.page) || 1;
  const itemsPerPage = 50;

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
    <>
      <header>
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow mb-9">FindYourCofounder</h1>
        <SearchBar users={users} />
      </header>
      <main className="flex flex-col items-center py-6 pb-12">
        <div className="flex flex-wrap self-stretch justify-center gap-12 mb-8">
          {users.map((user, i) => (
            <Card user={user} key={i} />
          ))}
        </div>
        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {searchParams.search ? "Aucun utilisateur trouvé pour cette recherche." : "Aucun utilisateur trouvé."}
          </p>
        )}
        <PaginationWrapper currentPage={currentPage} totalItems={total} itemsPerPage={itemsPerPage} />
      </main>
    </>
  );
}
