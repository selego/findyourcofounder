import { SearchBar } from "@/app/components/search-bar";
import { Card } from "@/app/components/card";
import { httpService } from "@/services/httpService";
import { configuredUrlForNoCashing } from "./utils/constants";

export default async function Home({ searchParams }) {
 const getUsers = async () => {
    try {
      const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`);
      if (!ok) return { messsage: "Error fetching users", users: [] };
      return { users: data.users };
    } catch (e) {
      return { users: [] };
    }
  };
  const {users} = await getUsers();

  return (
    <>
      <header>
        <h1 className="lg:text-5xl text-3xl text-center lg:text-shadow mb-9">FindYourCofounder</h1>
        <SearchBar users={users} />
      </header>
      <main className="flex flex-wrap self-stretch justify-center py-6 pb-12 gap-12">
        {users.map((user, i) => (
          <Card user={user} key={i} />
        ))}
      </main>
    </>
  );
}
