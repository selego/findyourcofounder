export const skillsColors = {
  Business: "bg-business",
  Design: "bg-design",
  Marketing: "bg-marketing",
  Product: "bg-product",
  Tech: "bg-tech",
};

export const BASE_URL = "http://localhost:3000";
export const SERVER_BASE_URL = "http://localhost:8080/findyourcofounder_user";

// remove cash on http requests temporary in dev env
export const configuredUrlForNoCashing = (path) =>
    process.env.NODE_ENV !== "development" ? `/${path}` : `/${path}?timestamp=${new Date().getTime()}`;
