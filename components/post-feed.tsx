"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Loader2, TrendingUp, Clock, Heart, Tag, X } from 'lucide-react'
import { PostCard } from "@/components/post-card"
import { useNotifications } from "@/components/notification-provider"

interface PostTag {
  id: number
  community_id: number
  name: string
  color: string
}

interface PostFeedProps {
  communityId?: number
  title?: string
  showCommunityName?: boolean
}

export function PostFeed({ communityId, title = "Posts", showCommunityName = false }: PostFeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "most_liked" | "hottest">("newest")
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
  const [availableTags, setAvailableTags] = useState<PostTag[]>([])
  const { error } = useNotifications()

  useEffect(() => {
    fetchPosts()
    if (communityId) {
      fetchTags()
    }
  }, [communityId, sortBy, selectedTagId])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      let url = "https://api.loryx.lol/posts/"
      if (communityId) {
        url = `https://api.loryx.lol/posts/community/${communityId}`
      }

      const params = new URLSearchParams({
        sort: sortBy,
        limit: "20",
      })

      if (selectedTagId) {
        params.append("tag_id", selectedTagId.toString())
      }

      url += `?${params.toString()}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to fetch posts")
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load posts"
      error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token || !communityId) return

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/post-tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableTags(data)
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err)
    }
  }

  const handleLike = async (postId: number, value: 1 | -1) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await fetch(`https://api.loryx.lol/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      })

      fetchPosts() // Refresh posts
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPosts() // Refresh posts
      }
    } catch (err) {
      console.error("Failed to delete post:", err)
    }
  }

  const getSortIcon = (sort: string) => {
    switch (sort) {
      case "newest":
        return <Clock className="h-4 w-4" />
      case "most_liked":
        return <Heart className="h-4 w-4" />
      case "hottest":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const selectedTag = availableTags.find((tag) => tag.id === selectedTagId)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="most_liked">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Most Liked
                  </div>
                </SelectItem>
                <SelectItem value="hottest">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Hottest
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by tag:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTagId === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTagId(null)}
                className="h-7"
              >
                All Posts
              </Button>
              {availableTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedTagId === tag.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTagId(tag.id)}
                  className="h-7"
                  style={
                    selectedTagId === tag.id
                      ? { backgroundColor: tag.color, borderColor: tag.color }
                      : { borderColor: tag.color, color: tag.color }
                  }
                >
                  {tag.name}
                </Button>
              ))}
            </div>
            {selectedTag && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing posts tagged with:</span>
                <Badge
                  style={{
                    backgroundColor: selectedTag.color + "20",
                    color: selectedTag.color,
                    borderColor: selectedTag.color,
                  }}
                >
                  {selectedTag.name}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTagId(null)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">{selectedTag ? `No posts found with tag "${selectedTag.name}"` : "No posts yet"}</p>
            <p className="text-xs">
              {selectedTag ? "Try selecting a different tag or view all posts" : "Be the first to share something!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                community_name={showCommunityName ? post.community_name : undefined}
                onLike={(value) => handleLike(post.id, value)}
                onDelete={() => handleDelete(post.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
