import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "How findyourcofounder works";
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
          padding: "72px 80px",
          color: "#0e1410",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 16,
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
            <span>The concept</span>
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
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <span>How&nbsp;</span>
                <span style={{ color: "#ff5a36", fontStyle: "italic", fontWeight: 500 }}>
                  findyourcofounder
                </span>
              </div>
              <div style={{ display: "flex" }}>works.</div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#2a2f2c",
                maxWidth: 760,
                lineHeight: 1.25,
              }}
            >
              No intermediaries, no matching algorithms — a curated list and a
              direct line to founders open to meeting.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#6b716c",
            }}
          >
            findyourcofounder.nl / .es
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
