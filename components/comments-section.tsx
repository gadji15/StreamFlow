"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface Comment {
  id: string
  user: {
    name: string
    avatar?: string
  }
  text: string
  rating: number
  date: string
}

interface CommentsProps {
  contentId: string
  contentType: "movie" | "series"
  initialComments?: Comment[]
}

export default function CommentsSection({ contentId, contentType, initialComments = [] }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newComment.trim() === "") return
    
    // In a real app, you would send this to your API
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: {
        name: "Utilisateur actuel",
        avatar: "/placeholder.svg?height=40&width=40" 
      },
      text: newComment,
      rating: userRating,
      date: new Date().toLocaleDateString()
    }
    
    setComments([newCommentObj, ...comments])
    setNewComment("")
    setUserRating(0)
  }
  
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Commentaires et avis</h2>
      
      {/* Add new comment */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Ajouter un commentaire</h3>
        
        {/* Rating selector */}
        <div className="flex items-center mb-4">
          <span className="mr-2">Votre note:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  className={`h-6 w-6 ${
                    star <= (hoverRating || userRating)
                      ? "fill-yellow-500 stroke-yellow-500"
                      : "stroke-gray-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Partagez votre avis sur ce contenu..."
          className="mb-4 bg-gray-900"
          rows={4}
        />
        
        <Button type="submit" className="btn-primary">
          Publier
        </Button>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-400">Soyez le premier à commenter ce contenu !</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-4 pb-4 border-b border-gray-800">
              <Avatar>
                <AvatarImage src={comment.user.avatar} />
                <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h4 className="font-medium text-sm mr-2">{comment.user.name}</h4>
                  <span className="text-gray-400 text-xs">{comment.date}</span>
                </div>
                
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= comment.rating
                          ? "fill-yellow-500 stroke-yellow-500"
                          : "stroke-gray-400"
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-300 text-sm">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}