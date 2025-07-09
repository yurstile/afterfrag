"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Upload, X, Loader2, ImageIcon, Video } from 'lucide-react'
import { useNotifications } from "@/components/notification-provider"

interface PostTag {
  id: number
  community_id: number
  name: string
  color: string
}

interface PostMedia {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface CreatePostDialogProps {
  communityId: number
  communityName: string
  availableTags: PostTag[]
  onPostCreated: () => void
}

export function CreatePostDialog({ communityId, communityName, availableTags, onPostCreated }: CreatePostDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [media, setMedia] = useState<PostMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useNotifications()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("https://api.loryx.lol/posts/upload-media", {
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
        setMedia((prev) => [...prev, mediaData])
      }
      success("Media uploaded successfully")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to upload media"
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (fileUuid: string) => {
    setMedia((prev) => prev.filter((m) => m.file_uuid !== fileUuid))
  }

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError("Title is required")
      showError("Title is required")
      return
    }

    if (!content.trim()) {
      setError("Content is required")
      showError("Content is required")
      return
    }

    setCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/posts/?community_id=${communityId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          post_tag_ids: selectedTags,
          media: media,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create post")
      }

      // Reset form
      setTitle("")
      setContent("")
      setSelectedTags([])
      setMedia([])
      setOpen(false)
      onPostCreated()
      success("Post created successfully!")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create post"
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post in f/{communityName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your post about?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={6}
              className="resize-none"
              required
            />
          </div>

          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color, color: "white" }
                        : { borderColor: tag.color, color: tag.color }
                    }
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Media (Optional)</Label>
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
                Upload Media
              </Button>
              <span className="text-sm text-gray-500">Images and videos up to 10MB</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {media.map((item) => (
                  <div key={item.file_uuid} className="relative group">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100">
                      {item.file_type === "image" ? (
                        <div className="flex items-center justify-center h-24">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-24">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeMedia(item.file_uuid)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.file_type} • {Math.round(item.file_size / 1024)}KB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || uploading}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
