import { SearchBar } from "@/app/components/search-bar";
import { Card } from "@/app/components/card";

import api from "@/lib/api";

export default async function Home({ searchParams }) {
  const { users } = await getUsers();

  // const filteredUsers = users.filter((user) => {
  //   const searchQuery = searchParams.search;
  //   const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
  //   return searchQuery ? fullName.includes(searchQuery.toLowerCase()) : user;
  // });

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

const getUsers = async () => {
  // return { users: [] }

  try {
    const res = await api.get("/api/user");
    return res;
  } catch (e) {
    console.log(e)
    return {users: []};
  }

  // const response = await fetch("http://localhost:3000/api/user", {
  //   cache: "no-store",
  // });
  // const res = await response.json();
  // return res;
};
