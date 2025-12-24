export const metadata = {
  title: "Developer CRM",
  description: "Self-hosted developer CRM"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f5f5", color: "#111" }}>{children}</body>
    </html>
  );
}
