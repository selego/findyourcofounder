const crypto = require("crypto");
const { NEWSLETTER_SECRET } = require("../config");

function b64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function signToken({ type, id }) {
  if (!NEWSLETTER_SECRET) throw new Error("NEWSLETTER_SECRET is not set");
  const payload = JSON.stringify({ type, id: String(id) });
  const hmac = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  return `${b64url(Buffer.from(payload))}.${b64url(hmac)}`;
}

function verifyToken(token) {
  if (!NEWSLETTER_SECRET) return null;
  const [payloadB64, hmacB64] = (token || "").split(".");
  if (!payloadB64 || !hmacB64) return null;

  let payload;
  try {
    payload = b64urlDecode(payloadB64).toString("utf8");
  } catch {
    return null;
  }

  const expected = crypto.createHmac("sha256", NEWSLETTER_SECRET).update(payload).digest();
  const got = b64urlDecode(hmacB64);
  if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;

  try {
    const obj = JSON.parse(payload);
    if (typeof obj !== "object" || obj === null) return null;
    if (obj.type !== "subscriber" && obj.type !== "cofounder") return null;
    if (typeof obj.id !== "string" || !obj.id) return null;
    return obj;
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
