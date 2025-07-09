"use client"

import { useState, useEffect } from "react"

export function useLikeStatus(postId: number) {
  const [userLike, setUserLike] = useState<1 | -1 | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (postId) {
      fetchLikeStatus()
    }
  }, [postId])

  const fetchLikeStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`https://app.afterfrag.com/posts/${postId}/like-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserLike(data.value)
      } else {
        console.error("Failed to fetch like status:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch like status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (value: 1 | -1) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return 0

      if (userLike === value) {
        // Unlike
        const response = await fetch(`https://app.afterfrag.com/posts/${postId}/like`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const oldValue = userLike
          setUserLike(null)
          return -oldValue
        } else {
          console.error("Failed to unlike post:", response.status, response.statusText)
        }
      } else {
        // Like or change like
        const response = await fetch(`https://app.afterfrag.com/posts/${postId}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value }),
        })

        if (response.ok) {
          const oldValue = userLike
          setUserLike(value)
          return oldValue ? value - oldValue : value
        } else {
          console.error("Failed to like post:", response.status, response.statusText)
        }
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
    return 0
  }

  return { userLike, loading, toggleLike }
}
