"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, MoreHorizontal, Edit, Trash2, Flag, Upload, Heart } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { MediaGallery } from "@/components/media-gallery"
import { getMediaUrl } from "@/utils/media-utils"

interface Comment {
  id: number
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
}

interface CommentSectionProps {
  postId: number
  communityName?: string
}

export function CommentSection({ postId, communityName }: CommentSectionProps) {
  const { user } = useCurrentUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/comments/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Fix media URLs
        const commentsWithFixedUrls = data.map((comment: Comment) => ({
          ...comment,
          media:
            (comment.media || []).map((media, idx) => ({
              id: idx,
              media_type: media.file_type || media.media_type,
              media_url: getMediaUrl(media.url || media.media_url),
              thumbnail_url: media.thumbnail_url ? getMediaUrl(media.thumbnail_url) : undefined,
            })) || [],
        }))
        setComments(commentsWithFixedUrls)
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const formData = new FormData()
      formData.append("content", newComment)
      if (selectedFiles[0]) {
        formData.append("file", selectedFiles[0])
      }

      const response = await fetch(`https://app.afterfrag.com/comments/post/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setNewComment("")
        setSelectedFiles([])
        fetchComments()
      } else {
        setError("Failed to post comment")
      }
    } catch (err) {
      setError("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (err) {
      console.error("Failed to delete comment:", err)
    }
  }

  const handleLikeComment = async (commentId: number, value: 1 | -1) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await fetch(`https://app.afterfrag.com/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      })

      fetchComments()
    } catch (err) {
      console.error("Failed to like comment:", err)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setSelectedFiles([file])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading comments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
                <AvatarImage src={getMediaUrl(user.profile_picture_url) || undefined} alt={user.username} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                  {user.username?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  rows={3}
                />

                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative bg-slate-700 rounded-lg p-2 text-sm text-slate-300">
                        <span>{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="ml-2 h-4 w-4 p-0 text-slate-400 hover:text-red-400"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="comment-media"
                    />
                    <label htmlFor="comment-media">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4" />
                          Add Media
                        </span>
                      </Button>
                    </label>
                    <span className="text-xs text-slate-500">Images and videos up to 10MB</span>
                  </div>

                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-500" />
              <h3 className="text-lg font-medium mb-2 text-slate-300">No comments yet</h3>
              <p className="text-slate-400">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-1 ring-blue-500/30">
                      <AvatarImage
                        src={getMediaUrl(comment.author_profile_picture_url) || undefined}
                        alt={comment.author_display_name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-sm">
                        {comment.author_display_name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{comment.author_display_name}</span>
                        <span className="text-slate-400 text-sm">@{comment.author_username}</span>
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                      {user && user.user_id === comment.user_id && (
                        <>
                          <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Comment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-slate-700" />
                        </>
                      )}
                      <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                        <Flag className="h-4 w-4 mr-2" />
                        Report Comment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-3">{comment.content}</div>

                {comment.media && comment.media.length > 0 && (
                  <div className="mb-3">
                    <MediaGallery media={comment.media} />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id, 1)}
                    className="gap-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{comment.like_count}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
