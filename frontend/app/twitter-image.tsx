import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WeLovePDF - Free Online PDF Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: 16,
          }}
        >
          WeLovePDF
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            opacity: 0.95,
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          Free Online PDF Tools
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            opacity: 0.85,
            marginTop: 32,
          }}
        >
          Merge • Split • Compress • Convert • AI-powered
        </div>
      </div>
    ),
    { ...size },
  );
}
