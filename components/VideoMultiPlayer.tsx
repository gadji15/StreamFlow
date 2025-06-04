import React, { useState } from "react";

/**
 * Composant pour afficher un lecteur Streamtape/Uqload avec switch.
 * 
 * @param props.streamtapeUrl (string) Lien complet Streamtape (ex: https://streamtape.com/v/xyz1234567/...)
 * @param props.uqloadUrl (string) Lien complet Uqload (ex: https://uqload.io/xyz1234567.html)
 */
export default function VideoMultiPlayer({
  streamtapeUrl,
  uqloadUrl,
  height = 420,
}: {
  streamtapeUrl?: string;
  uqloadUrl?: string;
  height?: number;
}) {
  // Par défaut, on affiche Streamtape si dispo, sinon Uqload
  const available = [
    streamtapeUrl ? "streamtape" : null,
    uqloadUrl ? "uqload" : null,
  ].filter(Boolean) as ("streamtape" | "uqload")[];

  const [active, setActive] = useState<"streamtape" | "uqload">(available[0] || "streamtape");

  if (available.length === 0) {
    return <div className="text-center text-red-500">Aucune source vidéo disponible.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      {/* Boutons de switch */}
      {available.length > 1 && (
        <div className="flex justify-center gap-3 mb-3">
          {streamtapeUrl && (
            <button
              className={`px-4 py-1 rounded-full font-bold transition ${
                active === "streamtape"
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActive("streamtape")}
            >
              Streamtape
            </button>
          )}
          {uqloadUrl && (
            <button
              className={`px-4 py-1 rounded-full font-bold transition ${
                active === "uqload"
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActive("uqload")}
            >
              Uqload
            </button>
          )}
        </div>
      )}

      {/* Lecteur vidéo */}
      <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
        {active === "streamtape" && streamtapeUrl && (
          <iframe
            src={streamtapeUrl.replace("/v/", "/e/")}
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            frameBorder={0}
            allow="autoplay; fullscreen"
            title="Lecteur Streamtape"
          />
        )}
        {active === "uqload" && uqloadUrl && (
          <iframe
            src={uqloadUrl}
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
            frameBorder={0}
            allow="autoplay; fullscreen"
            title="Lecteur Uqload"
          />
        )}
      </div>
    </div>
  );
}