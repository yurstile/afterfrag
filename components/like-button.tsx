"use client"

import { Button } from "@/components/ui/button"
import { Heart, ChevronDown } from 'lucide-react'
import { useLikeStatus } from "@/hooks/use-like-status"

interface LikeButtonProps {
  itemId: number
  itemType: "post" | "comment"
  initialLikeCount: number
  onLikeChange?: (newCount: number) => void
}

export function LikeButton({ itemId, itemType, initialLikeCount, onLikeChange }: LikeButtonProps) {
  const { likeCount, userLike, loading, handleLike } = useLikeStatus({
    itemId,
    itemType,
    initialLikeCount,
  })

  const onLikeClick = async (value: 1 | -1) => {
    await handleLike(value)
    if (onLikeChange) {
      onLikeChange(likeCount)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1 h-8 px-2 transition-colors ${
          userLike === 1 ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
        }`}
        onClick={() => onLikeClick(1)}
        disabled={loading}
      >
        <Heart className={`h-4 w-4 transition-all ${userLike === 1 ? "fill-current scale-110" : ""}`} />
        {likeCount}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1 h-8 px-2 transition-colors ${
          userLike === -1 ? "text-blue-500 hover:text-blue-600" : "hover:text-blue-500"
        }`}
        onClick={() => onLikeClick(-1)}
        disabled={loading}
      >
        <ChevronDown className={`h-4 w-4 transition-all ${userLike === -1 ? "scale-110" : ""}`} />
      </Button>
    </div>
  )
}
