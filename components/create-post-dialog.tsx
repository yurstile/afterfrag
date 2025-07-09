"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Upload, X } from "lucide-react"

interface PostTag {
  id: number
  name: string
  color: string
}

interface CreatePostDialogProps {
  communityId: number
  communityName: string
  availableTags: PostTag[]
  onPostCreated: () => void
}

export function CreatePostDialog({ communityId, communityName, availableTags, onPostCreated }: CreatePostDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<PostTag[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const formData = new FormData()
      formData.append("community_id", communityId.toString())
      formData.append("title", title)
      formData.append("content", content)
      formData.append("post_tag_ids", JSON.stringify(selectedTags.map((tag) => tag.id)))

      selectedFiles.forEach((file) => {
        formData.append("media", file)
      })

      const response = await fetch(`https://app.afterfrag.com/posts/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        setSelectedTags([])
        setSelectedFiles([])
        setIsOpen(false)
        onPostCreated()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to create post")
      }
    } catch (err) {
      setError("Failed to create post")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = (tag: PostTag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const removeTag = (tagId: number) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Post</DialogTitle>
          <DialogDescription className="text-slate-300">Share your thoughts with f/{communityName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Title</label>
            <Input
              placeholder="What's your post about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1">{title.length}/200 characters</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Content</label>
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 min-h-[120px]"
              maxLength={5000}
            />
            <p className="text-xs text-slate-400 mt-1">{content.length}/5000 characters</p>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Tags (Optional)</label>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{
                        backgroundColor: tag.color + "30",
                        borderColor: tag.color + "50",
                        color: tag.color,
                      }}
                      className="border cursor-pointer hover:opacity-80"
                      onClick={() => removeTag(tag.id)}
                    >
                      {tag.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <Select
                onValueChange={(value) => {
                  const tag = availableTags.find((t) => t.id === Number.parseInt(value))
                  if (tag) addTag(tag)
                }}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Add a tag..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableTags
                    .filter((tag) => !selectedTags.find((t) => t.id === tag.id))
                    .map((tag) => (
                      <SelectItem key={tag.id} value={tag.id.toString()} className="text-slate-300 hover:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Media Upload */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Media (Optional)</label>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600"
                  >
                    <span className="text-sm text-slate-300 truncate">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="post-media"
            />
            <label htmlFor="post-media">
              <Button
                variant="outline"
                className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white w-full bg-transparent"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Add Images/Videos (Max 5)
                </span>
              </Button>
            </label>
            <p className="text-xs text-slate-400 mt-1">Images and videos up to 10MB each</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? "Creating..." : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
