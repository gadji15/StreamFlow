import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorite } from "@/hooks/useFavorite";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteButtonProps {
  contentId: string;
  type: "film" | "serie" | "episode";
  disabled?: boolean;
  className?: string;
}

export default function FavoriteButton({
  contentId,
  type,
  disabled = false,
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, loading, toggleFavorite } = useFavorite(contentId, type);
  const { toast } = useToast();

  const handleClick = async () => {
    const ok = await toggleFavorite();
    if (ok) {
      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite
          ? "Ce contenu a été retiré de vos favoris."
          : "Ce contenu a été ajouté à vos favoris.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de modifier vos favoris.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={isFavorite ? "secondary" : "outline"}
      size="icon"
      className={`group transition-all duration-150 ${className}`}
      onClick={handleClick}
      disabled={loading || disabled}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      type="button"
    >
      <Heart
        className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
          isFavorite ? "fill-current text-red-500" : "text-gray-300"
        } group-hover:text-red-500`}
        fill={isFavorite ? "currentColor" : "none"}
      />
      <span className="sr-only">
        {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
}