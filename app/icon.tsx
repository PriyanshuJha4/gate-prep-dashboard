import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 112,
        background: "#07111f",
        color: "#e6fbff",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{ fontSize: 92, fontWeight: 800, color: "#67e8f9" }}>GATE</div>
        <div style={{ fontSize: 68, fontWeight: 700 }}>CS 2027</div>
        <div style={{ width: 220, height: 12, marginTop: 28, borderRadius: 8, background: "#34d399" }} />
      </div>
    ),
    size,
  );
}