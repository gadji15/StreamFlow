import React from "react";

export function VipBadge() {
  return (
    <span className="ml-1 text-xs bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-1.5 py-0.5 rounded-full font-bold">
      VIP
    </span>
  );
}

// Exportation par défaut pour être compatible avec les deux types d'importation
export default VipBadge;