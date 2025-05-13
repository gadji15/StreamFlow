import React from "react";

/**
 * Container responsive pour centrer et limiter la largeur des pages/formulaires admin qui le nécessitent.
 * Usage : <AdminPageContainer>...</AdminPageContainer>
 * maxWidth : par défaut "md:max-w-3xl", peut être surchargé.
 */
export default function AdminPageContainer({
  children,
  maxWidth = "md:max-w-3xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className={`w-full mx-auto ${maxWidth}`}>
      {children}
    </div>
  );
}
