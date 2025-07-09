"use client"

import { useState, useEffect } from "react"
import { useNotifications } from "@/components/notification-provider"

interface UseLikeStatusProps {
  itemId: number
  itemType: "post" | "comment"
  initialLikeCount: number
}

export function useLikeStatus({ itemId, itemType, initialLikeCount }: UseLikeStatusProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [userLike, setUserLike] = useState<1 | -1 | null>(null)
  const [loading, setLoading] = useState(false)
  const { success, error } = useNotifications()

  // Fetch user's current like status
  useEffect(() => {
    fetchUserLikeStatus()
  }, [itemId, itemType])

  const fetchUserLikeStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      // Note: This endpoint would need to be implemented in the backend
      // For now, we'll skip this and rely on the initial state
      // const response = await fetch(`https://api.loryx.lol/${itemType}s/${itemId}/like-status`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })

      // if (response.ok) {
      //   const data = await response.json()
      //   setUserLike(data.user_like)
      // }
    } catch (err) {
      console.error("Failed to fetch like status:", err)
    }
  }

  const handleLike = async (value: 1 | -1) => {
    if (loading) return

    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        error("Please log in to like posts")
        return
      }

      // If user clicks the same button they already clicked, remove the like/dislike
      if (userLike === value) {
        const response = await fetch(`https://api.loryx.lol/${itemType}s/${itemId}/like`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setLikeCount((prev) => prev - value)
          setUserLike(null)
          success(`${itemType === "post" ? "Post" : "Comment"} reaction removed`)
        } else {
          const errorData = await response.json()
          error(errorData.detail || `Failed to remove ${itemType} reaction`)
        }
      } else {
        // Add or change like/dislike
        const response = await fetch(`https://api.loryx.lol/${itemType}s/${itemId}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value }),
        })

        if (response.ok) {
          let countChange = value

          // If user had a previous like/dislike, account for removing it
          if (userLike !== null) {
            countChange = value - userLike
          }

          setLikeCount((prev) => prev + countChange)
          setUserLike(value)
          
          const action = value === 1 ? "liked" : "disliked"
          success(`${itemType === "post" ? "Post" : "Comment"} ${action}!`)
        } else {
          const errorData = await response.json()
          error(errorData.detail || `Failed to ${value === 1 ? "like" : "dislike"} ${itemType}`)
        }
      }
    } catch (err) {
      error(`Failed to ${userLike === value ? "remove reaction from" : value === 1 ? "like" : "dislike"} ${itemType}`)
      console.error(`Failed to ${userLike === value ? "unlike" : "like"} ${itemType}:`, err)
    } finally {
      setLoading(false)
    }
  }

  return {
    likeCount,
    userLike,
    loading,
    handleLike,
  }
}
