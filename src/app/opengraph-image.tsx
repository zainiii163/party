import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cousins Winter Reunion 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #081426 0%, #172840 55%, #081426 100%)", color: "#F8F5EF", fontFamily: "serif" }}>
        <div style={{ display: "flex", border: "1px solid rgba(216,174,99,0.5)", borderRadius: 18, padding: "54px 72px", flexDirection: "column", alignItems: "center" }}>
          <div style={{ color: "#D8AE63", fontSize: 24, letterSpacing: 8, marginBottom: 20 }}>YOU&apos;RE INVITED</div>
          <div style={{ fontSize: 74, textAlign: "center", lineHeight: 1.1, color: "#F2D7A0" }}>Cousins Winter<br/>Reunion 2026</div>
          <div style={{ fontSize: 26, color: "#A8B5C8", marginTop: 24 }}>One Family. Endless Memories.</div>
          <div style={{ width: 320, height: 1, background: "#D8AE63", marginTop: 32 }} />
        </div>
      </div>
    ),
    size,
  );
}
