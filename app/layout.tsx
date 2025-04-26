import "./globals.css";

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div style={{ color: "white", background: "#111", minHeight: "100vh", padding: "20px" }}>
          <h1>Test StreamFlow</h1>
          {children}
        </div>
      </body>
    </html>
  );
}