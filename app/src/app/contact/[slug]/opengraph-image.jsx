import { ImageResponse } from "next/og";
import { httpService } from "@/services/httpService";
import { tintForKey } from "@/app/components/humaaans/palette";

export const runtime = "nodejs";
export const alt = "Founder card on findyourcofounder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TINT_HEX = {
  salmon: "#ff9b7a",
  violet: "#b58af7",
  mustard: "#f4c95d",
  rose: "#f4b4b4",
  mint: "#9ddfae",
  cobalt: "#5a6cff",
};

async function fetchFounder(slug) {
  try {
    const { data } = await httpService.get(`/slug/${slug}`);
    return data ?? null;
  } catch {
    return null;
  }
}

export default async function Image({ params }) {
  const data = await fetchFounder(params.slug);
  const fullName = data
    ? `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "Founder"
    : "Founder";
  const city = data?.city || "—";
  const skills = (data?.skills || []).slice(0, 3);
  const tintKey = tintForKey(
    data?._id || data?.slug || params.slug || fullName,
  );
  const tint = TINT_HEX[tintKey] || TINT_HEX.salmon;
  const firstNameInitial = (data?.first_name?.[0] || "F").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4f1ea",
          display: "flex",
          color: "#0e1410",
        }}
      >
        <div
          style={{
            width: 420,
            background: tint,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 40px",
            borderRight: "2px solid #0e1410",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#0e1410",
            }}
          >
            {city}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 220,
              fontWeight: 800,
              lineHeight: 1,
              color: "#0e1410",
              opacity: 0.18,
              letterSpacing: "-0.06em",
            }}
          >
            {firstNameInitial}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6b716c",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: "#ff5a36",
                borderRadius: 999,
                display: "block",
              }}
            />
            <span>Open to meeting</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                fontSize: 84,
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
              }}
            >
              <span>{data?.first_name || "Founder"}&nbsp;</span>
              <span style={{ color: "#ff5a36", fontStyle: "italic", fontWeight: 500 }}>
                {data?.last_name || ""}
              </span>
            </div>

            {skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {skills.map((skill) => (
                  <div
                    key={skill}
                    style={{
                      display: "flex",
                      fontSize: 22,
                      fontWeight: 600,
                      padding: "10px 22px",
                      border: "2px solid #0e1410",
                      borderRadius: 999,
                      background: "#ffffff",
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6b716c",
            }}
          >
            <span>findyourcofounder</span>
            <span>The index</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
