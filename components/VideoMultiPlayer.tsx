import React, { useState } from "react";

// Helper pour transformer une URL Uqload en URL embed
function getUqloadEmbedUrl(url: string) {
  try {
    // Match ID dans l'URL: https://uqload.net/xyz123.html ou https://uqload.io/xyz123.html
    const match = url.match(/uqload\.(?:net|io)\/([a-zA-Z0-9]+)\.html/);
    if (match && match[1]) {
      return `https://uqload.${url.includes('.io') ? 'io' : 'net'}/embed-${match[1]}.html`;
    }
  } catch {}
  return url; // fallback
}

/**
 * Composant pour afficher un lecteur Streamtape/Uqload avec switch.
 * 
 * @param props.streamtapeUrl (string) Lien complet Streamtape (ex: https://streamtape.com/v/xyz1234567/...)
 * @param props.uqloadUrl (string) Lien complet Uqload (ex: https://uqload.io/xyz1234567.html)
 */
export default function VideoMultiPlayer({
  videoUrl,
  streamtapeUrl,
  uqloadUrl,
  height = 420,
}: {
  videoUrl?: string;
  streamtapeUrl?: string;
  uqloadUrl?: string;
  height?: number;
}) {
  // Inclure toutes les sources disponibles
  const available = [
    videoUrl ? "video" : null,
    streamtapeUrl ? "streamtape" : null,
    uqloadUrl ? "uqload" : null,
  ].filter(Boolean) as ("video" | "streamtape" | "uqload")[];

  const [active, setActive] = useState<"video" | "streamtape" | "uqload">(available[0] ?? "video");

  // Réinitialiser le player si les sources changent
  React.useEffect(() => {
    if (available.length && !available.includes(active)) {
      setActive(available[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, streamtapeUrl, uqloadUrl]);

  if (available.length === 0) {
    return <div className="text-center text-red-500">Aucune source vidéo disponible.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      {/* Boutons de switch */}
      {available.length > 1 && (
        <div className="flex justify-center gap-3 mb-3">
          {videoUrl && (
            <button
              className={`px-4 py-1 rounded-full font-bold transition ${
                active === "video"
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setActive("video")}
            >
              Vidéo directe
            </button>
          )}
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
        {/* Vidéo directe (mp4 ou autre) */}
        {active === "video" && videoUrl && (
          videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={videoUrl}
              controls
              className="absolute top-0 left-0 w-full h-full rounded"
              style={{ background: "black" }}
              poster=""
            />
          ) : videoUrl.includes("uqload.net") || videoUrl.includes("uqload.io") ? (
            <iframe
              src={getUqloadEmbedUrl(videoUrl)}
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              frameBorder={0}
              allow="autoplay; fullscreen"
              title="Lecteur Uqload"
            />
          ) : videoUrl.includes("streamtape.com") ? (
            <iframe
              src={videoUrl.replace("/v/", "/e/")}
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              frameBorder={0}
              allow="autoplay; fullscreen"
              title="Lecteur Streamtape"
            />
          ) : (
            <iframe
              src={videoUrl}
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              frameBorder={0}
              allow="autoplay; fullscreen"
              title="Lecteur vidéo"
            />
          )
        )}
        {/* Streamtape */}
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
        {/* Uqload */}
        {active === "uqload" && uqloadUrl && (
          <iframe
            src={getUqloadEmbedUrl(uqloadUrl)}
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