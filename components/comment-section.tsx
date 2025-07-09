"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Upload,
  X,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Video,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatLastOnline } from "@/utils/date-utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LikeButton } from "@/components/like-button"
import { useNotifications } from "@/components/notification-provider"
import { MediaGallery } from "@/components/media-gallery"
import Link from "next/link"

interface CommentMedia {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  like_count: number
  created_at: string
  updated_at: string
  media: CommentMedia[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  parent_id?: number | null
  children?: Comment[]
}

interface CommentSectionProps {
  postId: number
  onCommentCreated?: () => void
  maxDepth?: number
}

interface CommentItemProps {
  comment: Comment
  depth: number
  maxDepth: number
  onReply: (commentId: number) => void
  onEdit: (comment: Comment) => void
  onDelete: (commentId: number) => void
  replyingTo: number | null
  onCancelReply: () => void
  onSubmitReply: (commentId: number, content: string, media: CommentMedia[]) => void
}

function CommentItem({
  comment,
  depth,
  maxDepth,
  onReply,
  onEdit,
  onDelete,
  replyingTo,
  onCancelReply,
  onSubmitReply,
}: CommentItemProps) {
  const { user } = useCurrentUser()
  const [collapsed, setCollapsed] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replyMedia, setReplyMedia] = useState<CommentMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useNotifications()

  // Fix media URLs to use api.loryx.lol
  const fixedMedia = comment.media.map((media) => ({
    ...media,
    url: media.url.replace(/^\/cdn\//, "https://api.loryx.lol/cdn/"),
  }))

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("https://api.loryx.lol/comments/upload-media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to upload media")
        }

        const mediaData = await response.json()
        setReplyMedia((prev) => [...prev, mediaData])
      }
      success("Media uploaded successfully")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload media"
      error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (fileUuid: string) => {
    setReplyMedia((prev) => prev.filter((m) => m.file_uuid !== fileUuid))
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      await onSubmitReply(comment.id, replyContent.trim(), replyMedia)
      setReplyContent("")
      setReplyMedia([])
      onCancelReply()
    } catch (err) {
      // Error handling is done in parent component
    } finally {
      setSubmitting(false)
    }
  }

  const hasChildren = comment.children && comment.children.length > 0
  const shouldShowContinueThread = depth >= maxDepth && hasChildren

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}`}>
      <Card className="mb-3">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={comment.author_profile_picture_url?.replace(/^\/cdn\//, "https://api.loryx.lol/cdn/") || undefined}
                alt={comment.author_display_name}
              />
              <AvatarFallback>{comment.author_display_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.author_display_name}</span>
                  <span className="text-sm text-gray-500">@{comment.author_username}</span>
                  <span className="text-sm text-gray-500">{formatLastOnline(comment.created_at)}</span>
                  {comment.updated_at !== comment.created_at && <span className="text-xs text-gray-500">(edited)</span>}
                  {hasChildren && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollapsed(!collapsed)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                  )}
                </div>

                {user && user.user_id === comment.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(comment)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</div>

              {fixedMedia.length > 0 && (
                <div className="mb-3">
                  <MediaGallery media={fixedMedia} />
                </div>
              )}

              <div className="flex items-center gap-4 mb-3">
                <LikeButton itemId={comment.id} itemType="comment" initialLikeCount={comment.like_count} />
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply(comment.id)}
                    className="gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <Card className="mb-3">
                  <CardContent className="pt-4">
                    <form onSubmit={handleSubmitReply} className="space-y-3">
                      <div className="flex gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profile_picture_url || undefined} alt={user?.username} />
                          <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Reply to ${comment.author_display_name}...`}
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="gap-2"
                          >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Add Media
                          </Button>
                          <span className="text-xs text-gray-500">Images and videos up to 10MB</span>
                        </div>

                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={onCancelReply}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting || uploading} size="sm">
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Replying...
                              </>
                            ) : (
                              "Reply"
                            )}
                          </Button>
                        </div>
                      </div>

                      {replyMedia.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {replyMedia.map((item) => (
                            <div key={item.file_uuid} className="relative group">
                              <div className="relative rounded-lg overflow-hidden bg-gray-100">
                                {item.file_type === "image" ? (
                                  <img
                                    src={
                                      item.url.replace(/^\/cdn\//, "https://api.loryx.lol/cdn/") || "/placeholder.svg"
                                    }
                                    alt="Reply media"
                                    className="w-full h-16 object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-16">
                                    <Video className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeMedia(item.file_uuid)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render children or continue thread link */}
      {!collapsed && hasChildren && (
        <div>
          {shouldShowContinueThread ? (
            <div className="ml-6 mb-3">
              <Link href={`/comments/${comment.id}`}>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <MessageCircle className="h-4 w-4" />
                  Continue this thread ({comment.children!.length} more{" "}
                  {comment.children!.length === 1 ? "reply" : "replies"})
                </Button>
              </Link>
            </div>
          ) : (
            comment.children?.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                replyingTo={replyingTo}
                onCancelReply={onCancelReply}
                onSubmitReply={onSubmitReply}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function CommentSection({ postId, onCommentCreated, maxDepth = 3 }: CommentSectionProps) {
  const { user } = useCurrentUser()
  const { success, error } = useNotifications()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [commentMedia, setCommentMedia] = useState<CommentMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editMedia, setEditMedia] = useState<CommentMedia[]>([])
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/comments/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else {
        const errorData = await response.json()
        error(errorData.detail || "Failed to load comments")
      }
    } catch (err) {
      error("Failed to load comments")
      console.error("Failed to fetch comments:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setErrorMessage("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("https://api.loryx.lol/comments/upload-media", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || "Failed to upload media")
        }

        const mediaData = await response.json()
        if (editingComment) {
          setEditMedia((prev) => [...prev, mediaData])
        } else {
          setCommentMedia((prev) => [...prev, mediaData])
        }
      }
      success("Media uploaded successfully")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload media"
      setErrorMessage(errorMsg)
      error(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (fileUuid: string) => {
    if (editingComment) {
      setEditMedia((prev) => prev.filter((m) => m.file_uuid !== fileUuid))
    } else {
      setCommentMedia((prev) => prev.filter((m) => m.file_uuid !== fileUuid))
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      setErrorMessage("Comment content is required")
      error("Comment content is required")
      return
    }

    setSubmitting(true)
    setErrorMessage("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/comments/post/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          media: commentMedia,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create comment")
      }

      setNewComment("")
      setCommentMedia([])
      fetchComments()
      success("Comment posted successfully!")

      if (onCommentCreated) {
        onCommentCreated()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create comment"
      setErrorMessage(errorMsg)
      error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId: number, content: string, media: CommentMedia[]) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          media,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create reply")
      }

      fetchComments()
      success("Reply posted successfully!")

      if (onCommentCreated) {
        onCommentCreated()
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create reply"
      error(errorMsg)
      throw err
    }
  }

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) {
      setErrorMessage("Comment content is required")
      error("Comment content is required")
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent.trim(),
          media: editMedia,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update comment")
      }

      setEditingComment(null)
      setEditContent("")
      setEditMedia([])
      fetchComments()
      success("Comment updated successfully!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update comment"
      setErrorMessage(errorMsg)
      error(errorMsg)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete comment")
      }

      fetchComments()
      success("Comment deleted successfully!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete comment"
      error(errorMsg)
    }
  }

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
    setEditMedia([...comment.media])
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent("")
    setEditMedia([])
  }

  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return count + 1 + (comment.children ? getTotalCommentCount(comment.children) : 0)
    }, 0)
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading comments...</p>
      </div>
    )
  }

  const totalComments = getTotalCommentCount(comments)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments ({totalComments})</h3>
      </div>

      {/* Create Comment Form */}
      {user && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profile_picture_url || undefined} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Add Media
                  </Button>
                  <span className="text-xs text-gray-500">Images and videos up to 10MB</span>
                </div>

                <Button type="submit" disabled={submitting || uploading} size="sm">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>

              {commentMedia.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {commentMedia.map((item) => (
                    <div key={item.file_uuid} className="relative group">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        {item.file_type === "image" ? (
                          <img
                            src={item.url.replace(/^\/cdn\//, "https://api.loryx.lol/cdn/") || "/placeholder.svg"}
                            alt="Comment media"
                            className="w-full h-16 object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-16">
                            <Video className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(item.file_uuid)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </form>
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            maxDepth={maxDepth}
            onReply={setReplyingTo}
            onEdit={startEdit}
            onDelete={handleDeleteComment}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onSubmitReply={handleSubmitReply}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet</p>
          <p className="text-xs">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  )
}
