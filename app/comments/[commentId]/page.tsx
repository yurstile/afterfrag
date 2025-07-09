"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MessageCircle, Heart, Share } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import { MediaGallery } from "@/components/media-gallery"
import { CommentSection } from "@/components/comment-section"

interface Comment {
  id: number
  post_id: number
  content: string
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  user_id: number
  like_count: number
  created_at: string
  updated_at: string
  media: Array<{
    id: number
    media_type: string
    media_url: string
    thumbnail_url?: string
  }>
  children?: Comment[]
}

export default function CommentPage() {
  const params = useParams()
  const commentId = Number.parseInt(params.commentId as string)
  const [comment, setComment] = useState<Comment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchComment()
  }, [commentId])

  const fetchComment = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(`https://app.afterfrag.com/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch comment")
      }

      const data = await response.json()
      setComment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comment")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token || !comment) return

      const response = await fetch(`https://app.afterfrag.com/comments/${comment.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: 1 }),
      })

      if (response.ok) {
        setComment((prev) => (prev ? { ...prev, like_count: prev.like_count + 1 } : null))
      }
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }

  const renderComment = (comment: Comment, isRoot = false) => (
    <Card key={comment.id} className={`bg-slate-800 border-slate-700 ${isRoot ? "" : "ml-8 mt-4"}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
            <AvatarImage src={comment.author_profile_picture_url || undefined} alt={comment.author_display_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              {comment.author_display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/profile/${comment.user_id}`}
                className="font-medium text-white hover:text-blue-300 transition-colors"
              >
                {comment.author_display_name}
              </Link>
              <span className="text-slate-400 text-sm">@{comment.author_username}</span>
              <span className="text-slate-500 text-sm">•</span>
              <span className="text-slate-400 text-sm">{formatDate(comment.created_at)}</span>
            </div>

            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">{comment.content}</div>

            {comment.media && comment.media.length > 0 && (
              <div className="mb-4">
                <MediaGallery media={comment.media} />
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20"
              >
                <Heart className="h-4 w-4" />
                <span>{comment.like_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <MessageCircle className="h-4 w-4" />
                Reply
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading comment...</p>
        </div>
      </div>
    )
  }

  if (error || !comment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error || "Comment not found"}</p>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href={`/posts/${comment.post_id}`}>
              <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Post
              </Button>
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <img src="/logo.png" alt="Afterfrag" className="h-8 w-8" />
              <span className="text-lg font-bold text-white">Afterfrag</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Main Comment */}
          {renderComment(comment, true)}

          {/* Nested Replies */}
          {comment.children && comment.children.length > 0 && (
            <div className="space-y-4">{comment.children.map((child) => renderComment(child))}</div>
          )}

          {/* Comment Section for Replies */}
          <CommentSection postId={comment.post_id} />
        </div>
      </main>
    </div>
  )
}
