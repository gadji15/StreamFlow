import React from "react";

/**
 * Container responsive pour centrer et limiter la largeur des pages/formulaires admin qui le nécessitent.
 * - Empêche le scroll horizontal (max-w-full, overflow-x-auto)
 * - Largeur limitée sur desktop, full sur mobile par défaut
 */
export default function AdminPageContainer({
  children,
  maxWidth = "md:max-w-3xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className={`w-full max-w-full ${maxWidth} mx-auto px-2 sm:px-4 md:px-0 overflow-x-auto`}>
      {children}
    </div>
  );
}