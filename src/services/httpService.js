// let ROOT_URL = "http://localhost:3000";

import { SERVER_BASE_URL, BASE_URL } from "@/app/utils/constants";

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

console.log("process.env.APP_COUNTRY in httpService", process.env.APP_COUNTRY)

class Api {
  ROOT_URL = "";
  headers = {
    "Content-Type": "application/json",
    "App-Country": process.env.APP_COUNTRY ?? "es",
  };
  noCash = process.env.NODE_ENV !== "development" ? `` : `?timestamp=${new Date().getTime()}`

  constructor(rootUrl) {
    this.ROOT_URL = rootUrl;
  }

  async get(url) {
    return fetch(`${this.ROOT_URL}${url}${this.noCash}`, { next: { revalidate: 0 } }).then((response) => response.json());
  }

  async post(url, data, headers) {
    return fetch(`${this.ROOT_URL}${url}${this.noCash}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: headers ?? this.headers,
    }).then((response) => response.json());
  }

  async put(url, data, headers) {
    return fetch(`${this.ROOT_URL}${url}${this.noCash}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: headers ?? this.headers,
    }).then((response) => response.json());
  }
}

export const httpService = new Api(SERVER_BASE_URL);
