export const skillsColors = {
  Business: "bg-business",
  Design: "bg-design",
  Marketing: "bg-marketing",
  Product: "bg-product",
  Tech: "bg-tech",
};

export const BASE_URL = "http://localhost:3000";
export const SERVER_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-cofounder.cleverapps.io/cofounder"
    : "http://localhost:8080/cofounder";
