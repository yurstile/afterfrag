"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Post {
  id: number
  title: string
  content: string
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  community_name?: string
  like_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  post_tags: string[]
  media: Array<{
    id: number
    media_type: string
    media_url: string
    thumbnail_url?: string
  }>
  user_id: number
}

interface PostFeedProps {
  apiUrl: string
  showCommunityName?: boolean
  emptyMessage?: string
}

export function PostFeed({ apiUrl, showCommunityName = false, emptyMessage = "No posts found" }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [apiUrl])

  const fetchPosts = async (offset = 0) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const url = new URL(apiUrl)
      url.searchParams.set("skip", offset.toString())
      url.searchParams.set("limit", "10")

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()

      if (offset === 0) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }

      setHasMore(data.length === 10)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    setLoadingMore(true)
    fetchPosts(posts.length)
  }

  const handleLike = (postId: number, value: 1 | -1) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, like_count: post.like_count + value } : post)),
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-300">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Button
          onClick={() => fetchPosts()}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        // Map backend media to frontend format
        const mappedMedia = (post.media || []).map((item, idx) => ({
          id: idx,
          media_type: item.file_type || item.media_type,
          media_url: item.url || item.media_url,
          thumbnail_url: item.thumbnail_url,
        }))
        return (
          <PostCard
            key={post.id}
            {...post}
            media={mappedMedia}
            community_name={post.community_name}
            showCommunityName={showCommunityName}
            onLike={handleLike}
          />
        )
      })}

      {hasMore && (
        <div className="text-center py-4">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
