'use client';

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import SearchBar from "./search-bar";

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = document.querySelector('#search-modal input');
        if (el) (el as HTMLInputElement).focus();
      }, 120);
    }
  }, [open]);

  // Escape key closes modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Click outside modal closes it
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        overlayRef.current &&
        e.target instanceof Node &&
        e.target === overlayRef.current
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      {/* Loupe bouton */}
      <button
        type="button"
        aria-label="Rechercher"
        onClick={() => setOpen(true)}
        className="p-2 rounded-md hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Search className="w-6 h-6 text-gray-200" />
      </button>

      {/* Modal de recherche */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="search-modal-overlay"
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              id="search-modal"
              role="dialog"
              aria-modal="true"
              className="w-full max-w-xl mx-auto mt-24 rounded-2xl bg-gray-900/80 shadow-xl border border-gray-700 relative px-6 py-8"
              style={{
                maxHeight: "90vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
              }}
              initial={{ scale: 0.96, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26, duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Fermer bouton */}
              <button
                type="button"
                aria-label="Fermer la recherche"
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-700 transition"
                onClick={() => setOpen(false)}
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <div className="mb-5">
                <h2 className="text-2xl font-bold text-center text-white mb-2 flex items-center gap-2 justify-center">
                  <Search className="w-6 h-6 text-primary" /> Recherche
                </h2>
                <p className="text-center text-gray-400">
                  Trouvez rapidement un film ou une série dans le catalogue.
                </p>
              </div>

              {/* SearchBar : dynamique et réel */}
              <div>
                <SearchBar />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
