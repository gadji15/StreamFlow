"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Trash2, Flag } from "lucide-react";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    isSelf?: boolean;
  };
  content: string;
  rating: number;
  createdAt: string;
  reported?: boolean;
}

interface CommentsProps {
  contentId: string;
  contentType: "movie" | "series";
  initialComments?: Comment[];
}

export function CommentsSection({
  contentId,
  contentType,
  initialComments = [],
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reporting, setReporting] = useState<string | null>(null);

  const handleSubmitComment = async () => {
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
      // Simuler l'ajout d'un commentaire
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newCommentItem: Comment = {
        id: `comment-${Date.now()}`,
        author: {
          name: "Utilisateur",
          avatar: undefined,
          isSelf: true,
        },
        content: newComment,
        rating,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [newCommentItem, ...prev]);
      setNewComment("");
      setRating(0);
    } catch (error) {
      setErrorMessage("Une erreur est survenue lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReportComment = (id: string) => {
    setReporting(id);
    setTimeout(() => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, reported: true } : c
        )
      );
      setReporting(null);
    }, 1000);
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
        return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
      }

      // Moins d'une semaine
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
      }

      // Format date
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
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
          placeholder={`Partagez votre avis sur ce ${contentType === "movie" ? "film" : "série"}...`}
          className="bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4"
          rows={4}
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
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  aria-label={`Donner ${star} étoile${star > 1 ? "s" : ""}`}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleSubmitComment} disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Publier"}
          </Button>
        </div>

        {errorMessage && (
          <p className="text-red-500 mt-2 text-sm">{errorMessage}</p>
        )}
      </div>

      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 p-6 rounded-lg relative group">
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
                      <span className="text-gray-400 font-bold text-lg">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < comment.rating ? "text-yellow-400 fill-current" : "text-gray-400"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-300 mb-2">{comment.content}</p>
              <div className="flex items-center gap-4 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                {comment.author.isSelf && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Supprimer"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </Button>
                )}
                {!comment.author.isSelf && !comment.reported && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Signaler"
                    onClick={() => handleReportComment(comment.id)}
                    disabled={reporting === comment.id}
                  >
                    <Flag className="w-5 h-5 text-yellow-400" />
                  </Button>
                )}
                {comment.reported && (
                  <span className="text-xs text-yellow-400">Signalé</span>
                )}
              </div>
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