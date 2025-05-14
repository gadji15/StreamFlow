import React from "react";

export default function VipBadge({ isvip }: { isvip: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isvip ? "bg-amber-500/20 text-amber-500" : "bg-gray-500/20 text-gray-400"
      }`}
    >
      {isvip ? "VIP" : "Non"}
    </span>
  );
}