import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "findyourcofounder — find your co-founder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4f1ea",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#0e1410",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              background: "#ff5a36",
              borderRadius: 999,
              display: "block",
            }}
          />
          <span>findyourcofounder</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
            }}
          >
            <div style={{ display: "flex" }}>Find the person</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <span>you&rsquo;d&nbsp;</span>
              <span style={{ color: "#ff5a36", fontStyle: "italic", fontWeight: 500 }}>
                build it with
              </span>
              <span>.</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#2a2f2c",
              maxWidth: 880,
              lineHeight: 1.25,
            }}
          >
            A curated index of founders open to meeting their co-founder.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#6b716c",
          }}
        >
          <span>The index · updated daily</span>
          <span>findyourcofounder.nl / .es</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
