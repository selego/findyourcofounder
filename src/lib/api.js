let ROOT_URL = 'https://findyourcofounder.es'

// if(window){
// if (window.location.href.includes('findyourcofounder.es')) {
//   ROOT_URL = "https://findyourcofounder.es";
// } else if (window.location.href.includes('findyourcofounder.nl')) {
//   ROOT_URL = "https://findyourcofounder.nl";
// } else {
//   ROOT_URL = "http://localhost:3000";
// }
// }
// console.log('ROOT_URL2', ROOT_URL)

console.log("process.env.APP_COUNTRY", process.env.APP_COUNTRY)

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
