const ROOT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXTAUTH_URL || `https://findyourcofounder.nl`
    : "http://localhost:3000";


console.log("ROOT_URL", ROOT_URL);

class api {
  async get(url) {
    return fetch(`${ROOT_URL}${url}`, { next: { revalidate: 0 } }).then((response) => response.json());
  }

  async post(url, data) {
    return fetch(`${ROOT_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  }
}

export default new api();
