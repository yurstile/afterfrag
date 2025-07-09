"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, MessageCircle, Share, Eye, MoreHorizontal, Edit, Trash2, Flag } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { MediaGallery } from "@/components/media-gallery"
import { CommentSection } from "@/components/comment-section"
import { LikeButton } from "@/components/like-button"

interface Post {
  id: number
  title: string
  content: string
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  community_name: string
  community_display_name: string
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

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useCurrentUser()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const postId = params.postId as string

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`https://app.afterfrag.com/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else if (response.status === 404) {
        setError("Post not found")
      } else {
        setError("Failed to load post")
      }
    } catch (err) {
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        router.push(`/f/${post?.community_name}`)
      }
    } catch (err) {
      console.error("Failed to delete post:", err)
    }
  }

  const handleLike = (value: 1 | -1) => {
    if (post) {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              like_count: prev.like_count + value,
            }
          : null,
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-200">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-red-500/20">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-bold mb-2 text-white">Post Not Found</h2>
              <p className="mb-4 text-red-200">{error}</p>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Map backend media to frontend format for MediaGallery
  const mappedMedia = (post.media || []).map((item, idx) => ({
    id: idx,
    media_type: item.file_type || item.media_type,
    media_url: item.url || item.media_url,
    thumbnail_url: item.thumbnail_url,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/f/${post.community_name}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to f/{post.community_name}
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-wygsedFsbzUPP0F7Z988Qqr7NPP93N.png"
                alt="Logo"
                className="h-6 w-6"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Afterfrag
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Post Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
                  <AvatarImage src={post.author_profile_picture_url || undefined} alt={post.author_display_name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                    {post.author_display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${post.user_id}`}
                      className="font-medium text-white hover:text-blue-300 transition-colors"
                    >
                      {post.author_display_name}
                    </Link>
                    <span className="text-slate-400 text-sm">@{post.author_username}</span>
                    <span className="text-slate-500">in</span>
                    <Link
                      href={`/f/${post.community_name}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      f/{post.community_name}
                    </Link>
                  </div>
                  <p className="text-sm text-slate-400">{formatDate(post.created_at)}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  {user && user.user_id === post.user_id && (
                    <>
                      <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeletePost}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                    </>
                  )}
                  <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-4 text-white">{post.title}</h1>

              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{post.content}</div>
            </div>

            {mappedMedia && mappedMedia.length > 0 && <MediaGallery media={mappedMedia} />}

            {post.post_tags && post.post_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.post_tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-900/30 text-blue-300 border-blue-500/30 hover:bg-blue-800/40 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <div className="flex items-center gap-6">
                <LikeButton postId={post.id} initialLikeCount={post.like_count} onLike={handleLike} />

                <div className="flex items-center gap-2 text-slate-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">{post.comment_count}</span>
                  <span className="text-sm">Comments</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </main>
    </div>
  )
}
