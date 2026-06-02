import { APP_COUNTRY } from "@/app/config";

import { SERVER_BASE_URL, BASE_URL } from "@/app/utils/constants";

class Api {
  ROOT_URL = "";
  headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };

  constructor(rootUrl) {
    this.ROOT_URL = rootUrl;
  }

  getHeaders() {
    return {
      ...this.headers,
      "App-Country": APP_COUNTRY ?? "es",
    };
  }

  async get(url) {
    const headers = this.getHeaders();
    return fetch(`${this.ROOT_URL}${url}`, {
      headers,
      credentials: "include",
    }).then((response) => response.json());
  }

  async post(url, data, headers) {
    const finalHeaders = headers ?? this.getHeaders();
    return fetch(`${this.ROOT_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: finalHeaders,
      credentials: "include",
    }).then((response) => response.json());
  }

  async put(url, data, headers) {
    const finalHeaders = headers ?? this.getHeaders();
    return fetch(`${this.ROOT_URL}${url}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: finalHeaders,
      credentials: "include",
    }).then((response) => response.json());
  }

  async delete(url, headers) {
    const finalHeaders = headers ?? this.getHeaders();
    return fetch(`${this.ROOT_URL}${url}`, {
      method: "DELETE",
      headers: finalHeaders,
      credentials: "include",
    }).then((response) => response.json());
  }
}

export const httpService = new Api(SERVER_BASE_URL);
