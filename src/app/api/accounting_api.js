const ROOT_URL = process.env.NODE_ENV === "production" ? `https://api-accounting.selego.co/findyourcofounder_user` : "http://localhost:8080/findyourcofounder_user";
const APP_COUNTRY = process.env.APP_COUNTRY ?? "es"

class accountingApi {
  async get(url) {
    return fetch(`${ROOT_URL}${url}`, { next: { revalidate: 0 } }).then((response) => response.json());
  }
  
  async post(url, data) {
    console.log({"App-Country": APP_COUNTRY});
    return fetch(`${ROOT_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "App-Country": APP_COUNTRY
      },
    }).then((response) => response.json());
  }
  
  
  async put(url, data) {
    return fetch(`${ROOT_URL}${url}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "App-Country": APP_COUNTRY
      },
    }).then((response) => response.json());
  }
}

export default new accountingApi();