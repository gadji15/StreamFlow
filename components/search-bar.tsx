"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film, Tv, Clock, TrendingUp, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Types
interface SearchResult {
  id: string;
  title: string;
  type: "movie" | "series";
  posterImage: string;
  year: number;
  rating: number;
}

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data for search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      title: "Captain America: Brave New World",
      type: "movie",
      posterImage: "/images/captain-america-poster.jpg",
      year: 2024,
      rating: 4.5
    },
    {
      id: "2",
      title: "The Last of Us",
      type: "series",
      posterImage: "/images/last-of-us-poster.jpg",
      year: 2023,
      rating: 4.8
    },
    {
      id: "3",
      title: "Deadpool & Wolverine",
      type: "movie",
      posterImage: "/images/deadpool-wolverine-poster.jpg",
      year: 2024,
      rating: 4.7
    },
    {
      id: "4",
      title: "Game of Thrones",
      type: "series",
      posterImage: "/images/got-poster.jpg",
      year: 2011,
      rating: 4.9
    }
  ];

  // Handle search input
  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsLoading(true);
      
      // Simulate API delay
      const timer = setTimeout(() => {
        // Filter mock results based on search query
        const filtered = mockResults.filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setResults(filtered);
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search trigger button */}
      <button
        className="flex items-center rounded-full hover:bg-surface-light p-2 transition-colors text-gray-300 hover:text-white"
        onClick={() => setIsOpen(true)}
        aria-label="Recherche"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only md:not-sr-only ml-2 hidden md:inline text-sm">
          Rechercher
        </span>
        <kbd className="hidden md:flex ml-2 items-center text-xs font-medium rounded border bg-surface-light px-1.5">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Full screen search modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          >
            <div className="fixed inset-0 flex items-start justify-center pt-20 px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl bg-surface border border-gray-800 rounded-xl shadow-2xl"
              >
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-gray-400" />
                    <form className="flex-1" onSubmit={handleSubmit}>
                      <input
                        ref={inputRef}
                        type="text"
                        className="w-full border-none bg-transparent outline-none placeholder:text-gray-500 text-base"
                        placeholder="Rechercher des films, séries, acteurs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </form>
                    <button
                      className="text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsOpen(false)}
                      aria-label="Fermer la recherche"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-800">
                  {isLoading ? (
                    <div className="p-4 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                    </div>
                  ) : searchQuery.length > 0 ? (
                    results.length > 0 ? (
                      <div className="max-h-[60vh] overflow-y-auto p-2">
                        {results.map((result) => (
                          <Link
                            key={result.id}
                            href={`/${result.type === "movie" ? "movies" : "series"}/${result.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-light transition-colors"
                          >
                            <div className="w-12 h-16 relative overflow-hidden rounded flex-shrink-0">
                              <Image
                                src={result.posterImage}
                                alt={result.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{result.title}</span>
                                <span className="text-xs text-gray-400">{result.year}</span>
                                {result.type === "movie" ? (
                                  <Film className="h-3 w-3 text-gray-400" />
                                ) : (
                                  <Tv className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                                <span className="text-xs text-gray-400">{result.rating}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        <p>Aucun résultat pour "{searchQuery}"</p>
                      </div>
                    )
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <h3 className="text-sm font-medium">Recherches récentes</h3>
                      </div>
                      <div className="space-y-1">
                        <button className="w-full text-left text-sm p-2 rounded-md hover:bg-surface-light transition-colors">
                          Avatar 2
                        </button>
                        <button className="w-full text-left text-sm p-2 rounded-md hover:bg-surface-light transition-colors">
                          Game of Thrones
                        </button>
                      </div>
                      
                      <div className="flex items-center mt-4 mb-2">
                        <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                        <h3 className="text-sm font-medium">Tendances</h3>
                      </div>
                      <div className="space-y-1">
                        <button className="w-full text-left text-sm p-2 rounded-md hover:bg-surface-light transition-colors">
                          Deadpool & Wolverine
                        </button>
                        <button className="w-full text-left text-sm p-2 rounded-md hover:bg-surface-light transition-colors">
                          Captain America: Brave New World
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}