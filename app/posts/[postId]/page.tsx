"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { PostCard } from "@/components/post-card"
import { CommentSection } from "@/components/comment-section"
import { useCurrentUser } from "@/hooks/use-current-user"

interface PostMedia {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface PostTag {
  id: number
  community_id: number
  name: string
  color: string
}

interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  like_count: number
  created_at: string
  updated_at: string
  media: any[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  parent_id?: number | null
  children?: Comment[]
}

interface Post {
  id: number
  community_id: number
  user_id: number
  title: string
  content: string
  post_tags: PostTag[]
  like_count: number
  view_count: number
  created_at: string
  updated_at: string
  media: PostMedia[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  comment_count: number
  comments?: Comment[]
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.postId as string
  const { user, loading: userLoading } = useCurrentUser()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [communityName, setCommunityName] = useState<string>("")

  useEffect(() => {
    if (user) {
      fetchPost()
    }
  }, [user, postId])

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(`https://api.loryx.lol/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError("Post not found")
        } else {
          throw new Error("Failed to fetch post")
        }
        return
      }

      const data = await response.json()
      setPost(data)

      // Fetch community name
      if (data.community_id) {
        fetchCommunityName(data.community_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const fetchCommunityName = async (communityId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCommunityName(data.name)
      }
    } catch (err) {
      console.error("Failed to fetch community name:", err)
    }
  }

  const handleLike = async (value: 1 | -1) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      })

      if (response.ok) {
        fetchPost() // Refresh post data
      }
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const handleUnlike = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/posts/${postId}/like`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPost() // Refresh post data
      }
    } catch (err) {
      console.error("Failed to unlike post:", err)
    }
  }

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit post")
  }

  const handleDelete = async () => {
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
        // Redirect back to community or dashboard
        if (communityName) {
          window.location.href = `/f/${communityName}`
        } else {
          window.location.href = "/dashboard"
        }
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to delete post")
      }
    } catch (err) {
      setError("Failed to delete post")
    }
  }

  const handleCommentCreated = () => {
    fetchPost() // Refresh post data to update comment count
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading post...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please log in to continue</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Post not found"}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Afterfrag</span>
              </div>
            </div>
            {communityName && (
              <Link href={`/f/${communityName}`}>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  View f/{communityName}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Post Detail */}
          <PostCard
            {...post}
            community_name={communityName}
            onLike={handleLike}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDetailView={true}
          />

          {/* Comments Section */}
          <CommentSection postId={post.id} onCommentCreated={handleCommentCreated} />
        </div>
      </main>
    </div>
  )
}
