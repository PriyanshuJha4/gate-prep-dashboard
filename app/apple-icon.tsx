import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 40,
        background: "#07111f",
        color: "#e6fbff",
        fontFamily: "Arial, sans-serif",
      }}>
        <div style={{ fontSize: 37, fontWeight: 800, color: "#67e8f9" }}>GATE</div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>CS 2027</div>
        <div style={{ width: 76, height: 5, marginTop: 10, borderRadius: 4, background: "#34d399" }} />
      </div>
    ),
    size,
  );
}