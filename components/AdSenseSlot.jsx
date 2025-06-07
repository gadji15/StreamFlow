"use client";
import { useEffect } from "react";

/**
 * Composant AdSense générique, slot paramétrable
 * Place-le où tu veux une pub AdSense (header, sidebar, in-article, etc.)
 */
export default function AdSenseSlot({ slot, style = {} }) {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, [slot]);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXX" // ← Mets ton vrai ID AdSense ici
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}