"use client";
import AdSenseSlot from "@/components/AdSenseSlot";
import { useHideAds } from "@/hooks/useHideAds";

export default function Sidebar() {
  const hideAds = useHideAds();

  return (
    <aside
      style={{
        width: 300,
        minWidth: 220,
        maxWidth: "90vw",
        padding: 16,
        background: "#fafbfc",
        borderLeft: "1px solid #eee",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Menu, liens, ou autres infos ici */}
      <nav style={{ marginBottom: 32 }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><a href="/">Accueil</a></li>
          <li><a href="/films">Films</a></li>
          <li><a href="/series">Séries</a></li>
          {/* ...autres liens... */}
        </ul>
      </nav>

      {/* PUB AdSense, masquée pour VIP/admin/super_admin */}
      {!hideAds && (
        <div style={{ width: "100%", margin: "24px 0" }}>
          <AdSenseSlot slot="1234567890" style={{ width: "100%", minHeight: 250 }} />
        </div>
      )}
    </aside>
  );
}