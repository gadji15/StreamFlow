import React from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContentSection from "@/components/content-section";

type SuggestionItem = {
  id: string;
  title: string;
  genre?: string;
  poster?: string;
  link: string;
};
type WatchLayoutProps = {
  title: string;
  seoTitle?: string;
  videoUrl: string;
  posterUrl?: string;
  backdropUrl?: string;
  description?: string;
  metadata?: React.ReactNode;
  afterPlayer?: React.ReactNode; // NOUVEAU : pour placer du contenu juste après le player
  children?: React.ReactNode;
  suggestions?: SuggestionItem[];
  suggestionsTitle?: string;
  suggestionsSubtitle?: string;
  suggestionsLink?: string;
  suggestionsLinkLabel?: string;
  onBack?: () => void;
  backLabel?: React.ReactNode; // <-- string -> React.ReactNode
  isVip?: boolean;
  error?: string | null;
  loading?: boolean;
  HeadExtra?: React.ReactNode;
};

export default function WatchLayout({
  title,
  seoTitle,
  videoUrl,
  posterUrl,
  backdropUrl,
  description,
  metadata,
  afterPlayer,
  children,
  suggestions = [],
  suggestionsTitle = "Suggestions",
  suggestionsSubtitle,
  suggestionsLink,
  suggestionsLinkLabel = "Voir tout",
  onBack,
  backLabel = "Retour",
  isVip,
  error,
  loading,
  HeadExtra,
}: WatchLayoutProps) {
  const router = useRouter();

  // Guard d'accès VIP (basique) -- à remplacer par un guard auth si besoin
  React.useEffect(() => {
    if (isVip && typeof window !== "undefined") {
      const isUserVip = window.localStorage.getItem("is_vip") === "true";
      if (!isUserVip) {
        // Rediriger vers une page d'accès refusé/upgrade
        router.push("/vip");
      }
    }
  }, [isVip, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <svg className="animate-spin h-14 w-14 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <div className="text-indigo-300 text-lg font-medium">Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black/90 px-4">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-300">{error}</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4 rounded-2xl text-lg px-6 py-3">
              {backLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Head>
        <title>{seoTitle || title}</title>
        {HeadExtra}
      </Head>
      {/* Backdrop */}
      {backdropUrl && (
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <img
            src={backdropUrl}
            alt={`Backdrop de ${title}`}
            className="w-full h-full object-cover object-center blur-[3px] brightness-60 scale-105"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/95" />
        </div>
      )}

      <main className="relative z-10 flex flex-col items-center flex-1 w-full px-2 sm:px-6 pt-20 pb-8">
        {/* Bouton retour */}
        {onBack && (
          <Button
            variant="secondary"
            className="mt-4 mb-4 left-0 sm:left-0 rounded-full shadow-lg bg-black/80 text-lg px-5 py-3 hover:scale-105 hover:bg-black/90 transition-all z-20"
            onClick={onBack}
            {...(typeof backLabel === "string" ? { "aria-label": backLabel } : {})}
          >
            {backLabel}
          </Button>
        )}

        {/* Player */}
        <div className="w-full max-w-3xl aspect-video rounded-2xl shadow-2xl overflow-hidden bg-black mt-10 mb-6 border border-gray-800">
          {videoUrl ? (
            <VideoPlayer src={videoUrl} poster={posterUrl} title={title} autoPlay />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Aucune vidéo disponible.</div>
          )}
        </div>

        {/* Bloc custom juste après le player */}
        {afterPlayer}

        {/* Metadata et infos */}
        {metadata && (
          <section className="w-full max-w-3xl mx-auto bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-lg px-6 py-6 flex flex-col gap-2 mb-8 border border-gray-800">
            {metadata}
          </section>
        )}
        {description && (
          <p className="text-gray-200 text-base whitespace-pre-line mt-1 max-w-3xl">{description}</p>
        )}

        {/* Custom children (ex : navigation épisodes, modals, etc) */}
        {children}

        {/* Suggestions similaires */}
        {suggestions && suggestions.length > 0 && (
          <div className="w-full max-w-6xl mx-auto mb-8">
            <ContentSection
              title={suggestionsTitle}
              subtitle={suggestionsSubtitle}
              viewAllLink={suggestionsLink}
              type="custom"
              hideViewAllButton={!suggestionsLink}
            >
              {suggestions.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  className={`
                    bg-gray-800 overflow-hidden transition-transform hover:scale-105 group
                    flex flex-col items-center
                    rounded-md
                    sm:rounded-lg md:rounded-xl
                    h-full
                  `}
                  aria-label={item.title}
                >
                  <div
                    className={`
                      relative aspect-[2/3]
                      w-full
                      h-full
                      flex flex-col items-center
                    `}
                  >
                    <img
                      src={item.poster || "/placeholder-poster.png"}
                      alt={item.title}
                      className={`
                        w-full h-full object-cover transition-all duration-300
                        rounded-md
                        sm:rounded-lg
                        md:rounded-xl
                      `}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {/* Icône contextuelle : Film ou Série */}
                      {/* On peut ajouter une prop pour différencier si besoin */}
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full px-1 pb-1 pt-1">
                    <h3 className={`
                      truncate font-medium w-full text-center
                      text-xs
                      sm:text-sm
                      md:text-base
                    `}>{item.title}</h3>
                    <p className="text-[11px] text-gray-400 w-full text-center">
                      {item.genre || ""}
                    </p>
                  </div>
                </a>
              ))}
            </ContentSection>
          </div>
        )}
      </main>
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s cubic-bezier(.23,1.02,.25,1) both;
        }
        footer, .footer, #footer {
          position: relative !important;
          z-index: 30 !important;
        }
      `}</style>
    </div>
  );
}

import { VideoPlayer } from "@/components/video-player";