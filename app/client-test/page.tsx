"use client";

import { useEffect, useState } from "react";

export default function ClientTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ 
      padding: "20px", 
      color: "white", 
      backgroundColor: "#333",
      minHeight: "100vh"
    }}>
      <h1>Client Test Page</h1>
      <p>Client-side rendering status: {mounted ? "Mounted" : "Not mounted"}</p>
      {mounted && (
        <div>
          <p>Cette partie n'apparaît qu'après hydratation côté client.</p>
          <button 
            onClick={() => alert("Le JavaScript fonctionne!")}
            style={{ 
              padding: "10px", 
              backgroundColor: "#7c3aed", 
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cliquez-moi
          </button>
        </div>
      )}
    </div>
  );
}