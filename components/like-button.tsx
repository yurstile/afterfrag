"use client"

import { Button } from "@/components/ui/button"
import { Heart, HeartOff } from "lucide-react"
import { useLikeStatus } from "@/hooks/use-like-status"

interface LikeButtonProps {
  postId: number
  initialLikeCount: number
  onLike?: (value: 1 | -1) => void
}

export function LikeButton({ postId, initialLikeCount, onLike }: LikeButtonProps) {
  const { userLike, loading, toggleLike } = useLikeStatus(postId)

  const handleLike = async () => {
    const change = await toggleLike(1)
    if (change !== 0 && onLike) {
      onLike(change as 1 | -1)
    }
  }

  const handleDislike = async () => {
    const change = await toggleLike(-1)
    if (change !== 0 && onLike) {
      onLike(change as 1 | -1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-8 h-8 bg-slate-700 rounded animate-pulse" />
        <span>{initialLikeCount}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`gap-1 ${
          userLike === 1
            ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
            : "text-slate-400 hover:text-red-400 hover:bg-red-900/20"
        }`}
      >
        <Heart className={`h-4 w-4 ${userLike === 1 ? "fill-current" : ""}`} />
        <span>{initialLikeCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDislike}
        className={`gap-1 ${
          userLike === -1
            ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            : "text-slate-400 hover:text-blue-400 hover:bg-blue-900/20"
        }`}
      >
        <HeartOff className={`h-4 w-4 ${userLike === -1 ? "fill-current" : ""}`} />
      </Button>
    </div>
  )
}
