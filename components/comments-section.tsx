"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  rating: number;
  createdAt: string;
}

interface CommentsProps {
  contentId: string;
  contentType: "movie" | "series";
  initialComments?: Comment[];
}

export function CommentsSection({ 
  contentId, 
  contentType, 
  initialComments = [] 
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const { user } = useCurrentUser();

  // Fetch comments from Supabase
  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("content_id", contentId)
        .eq("content_type", contentType)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setComments(
          data.map((c: any) => ({
            id: c.id,
            author: {
              name: c.author_name || "Utilisateur",
              avatar: c.author_avatar,
            },
            content: c.content,
            rating: c.rating,
            createdAt: c.created_at,
          }))
        );
      } else {
        setComments([]);
      }
      setLoading(false);
    }
    if (contentId && contentType) fetchComments();
  }, [contentId, contentType]);

  const handleSubmitComment = async () => {
    if (!user) {
      setErrorMessage("Vous devez être connecté pour commenter.");
      return;
    }
    if (!newComment.trim()) {
      setErrorMessage("Veuillez entrer un commentaire");
      return;
    }
    if (rating === 0) {
      setErrorMessage("Veuillez attribuer une note");
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("comments").insert([
        {
          content_id: contentId,
          content_type: contentType,
          author_id: user.id,
          author_name: user.user_metadata?.name || user.email || "Utilisateur",
          author_avatar: user.user_metadata?.avatar_url || null,
          content: newComment,
          rating: rating,
        },
      ]);
      if (error) {
        setErrorMessage("Erreur lors de l'ajout du commentaire");
      } else {
        // Refresh comments
        const { data } = await supabase
          .from("comments")
          .select("*")
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .order("created_at", { ascending: false });
        if (data) {
          setComments(
            data.map((c: any) => ({
              id: c.id,
              author: {
                name: c.author_name || "Utilisateur",
                avatar: c.author_avatar,
              },
              content: c.content,
              rating: c.rating,
              createdAt: c.created_at,
            }))
          );
        }
        setNewComment("");
        setRating(0);
      }
    } catch (error) {
      setErrorMessage("Une erreur est survenue lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // Moins d'un jour
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours < 1) {
          return "Il y a quelques minutes";
        }
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      }
      
      // Moins d'une semaine
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      }
      
      // Format date
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="font-medium mb-4">Ajouter un commentaire</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            !user
              ? "Connectez-vous pour commenter..."
              : `Partagez votre avis sur ce ${contentType === "movie" ? "film" : "série"}...`
          }
          className="bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4"
          rows={4}
          disabled={!user}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">Note :</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 cursor-pointer ${
                    star <= (hoveredStar || rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-400"
                  }`}
                  onClick={() => user && setRating(star)}
                  onMouseEnter={() => user && setHoveredStar(star)}
                  onMouseLeave={() => user && setHoveredStar(0)}
                />
              ))}
            </div>
          </div>
          <Button 
            onClick={handleSubmitComment} 
            disabled={isSubmitting || !user}
          >
            {isSubmitting ? "Envoi en cours..." : "Publier"}
          </Button>
        </div>
        
        {errorMessage && (
          <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
        )}
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-700 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                    {comment.author.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt={comment.author.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">{comment.author.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < comment.rating ? "text-yellow-400 fill-current" : "text-gray-400"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg mb-2">Aucun commentaire pour le moment</p>
          <p className="text-sm">Soyez le premier à partager votre avis !</p>
        </div>
      )}
    </div>
  );
}

export default CommentsSection;