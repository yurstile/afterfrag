"use client"

import { useState, useEffect, useCallback } from "react"

interface Post {
  id: number
  title: string
  content: string
  user_id: number
  username: string
  display_name: string
  profile_picture_url: string | null
  community_id: number
  community_name: string
  tags: string[]
  like_count: number
  comment_count: number
  user_like_status: number | null
  created_at: string
  updated_at: string
  media_urls: string[]
}

export function useRecommendations(userId?: number) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasMore, setHasMore] = useState(true)

  const fetchRecommendations = useCallback(
    async (refresh = false) => {
      if (!userId) return

      try {
        setLoading(true)
        if (refresh) {
          setError("")
        }

        const token = localStorage.getItem("access_token")
        if (!token) {
          window.location.href = "/login"
          return
        }

        const response = await fetch(`https://app.afterfrag.com/users/${userId}/home/recommendations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (refresh) {
            setPosts(data)
          } else {
            setPosts((prev) => [...prev, ...data])
          }
          setHasMore(data.length === 20) // Assuming 20 is the page size
        } else {
          throw new Error("Failed to fetch recommendations")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recommendations")
      } finally {
        setLoading(false)
      }
    },
    [userId],
  )

  const refreshPosts = useCallback(() => {
    fetchRecommendations(true)
  }, [fetchRecommendations])

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecommendations(false)
    }
  }, [fetchRecommendations, loading, hasMore])

  useEffect(() => {
    if (userId) {
      fetchRecommendations(true)
    }
  }, [userId, fetchRecommendations])

  return {
    posts,
    loading,
    error,
    refreshPosts,
    loadMorePosts,
    hasMore,
  }
}
