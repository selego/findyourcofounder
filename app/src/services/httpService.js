import { APP_COUNTRY } from "@/app/config";

import { SERVER_BASE_URL } from "@/app/utils/constants";

async function parseResponse(response, url) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(
      "[fyc] httpService non-JSON response",
      JSON.stringify({
        url,
        status: response.status,
        contentType: response.headers.get("content-type"),
        bodyPreview: text.slice(0, 300),
      }),
    );
    throw e;
  }
}

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
    const fullUrl = `${this.ROOT_URL}${url}`;
    const response = await fetch(fullUrl, {
      headers: this.getHeaders(),
      credentials: "include",
    });
    return parseResponse(response, fullUrl);
  }

  async post(url, data, headers) {
    const fullUrl = `${this.ROOT_URL}${url}`;
    const response = await fetch(fullUrl, {
      method: "POST",
      body: JSON.stringify(data),
      headers: headers ?? this.getHeaders(),
      credentials: "include",
    });
    return parseResponse(response, fullUrl);
  }

  async put(url, data, headers) {
    const fullUrl = `${this.ROOT_URL}${url}`;
    const response = await fetch(fullUrl, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: headers ?? this.getHeaders(),
      credentials: "include",
    });
    return parseResponse(response, fullUrl);
  }

  async delete(url, headers) {
    const fullUrl = `${this.ROOT_URL}${url}`;
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers: headers ?? this.getHeaders(),
      credentials: "include",
    });
    return parseResponse(response, fullUrl);
  }
}

export const httpService = new Api(SERVER_BASE_URL);
