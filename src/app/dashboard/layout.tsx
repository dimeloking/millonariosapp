import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        background: "#0a0b0d",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <main style={{ overflow: "auto", display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}
