"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SeriesIcon } from "@heroicons/react/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Serie = {
  id: number;
  title: string;
};

const fakeSeriesList: Serie[] = [
  { id: 1, title: "Stranger Things" },
  { id: 2, title: "Breaking Bad" },
  // Add more fake series here
];

export default function SeriesPage() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSeries, setFilteredSeries] = useState<Serie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      // Fetch series list from API/Database here
      // For mock data, we'll set fakeSeriesList
      const response = fakeSeriesList; // Replace with your fetch code

      setIsLoading(false);
      setSeries(response);
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les séries. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredSeries(series);
    } else {
      setFilteredSeries(
        series.filter((serie) =>
          serie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, series]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
          Liste des séries
        </h1>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une série..."
          className="bg-gray-800 border-gray-700 max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {/* Series List */}
          {filteredSeries.length > 0 ? (
            filteredSeries.map((serie) => (
              <div
                key={serie.id}
                className="bg-gray-900 rounded-lg p-4 flex justify-between items-center"
              >
                <h2 className="text-lg font-medium">{serie.title}</h2>
                <Button variant="secondary" size="sm">
                  Voir les détails
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">
              Aucune série correspondante trouvée.
            </div>
          )}
        </div>
      )}
    </div>
  );
}