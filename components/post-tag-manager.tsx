"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Loader2, Tag } from "lucide-react"

interface PostTag {
  id: number
  community_id: number
  name: string
  color: string
}

interface PostTagManagerProps {
  communityId: number
  communityName: string
  canManage: boolean
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
]

export function PostTagManager({ communityId, communityName, canManage }: PostTagManagerProps) {
  const [tags, setTags] = useState<PostTag[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<PostTag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTags()
  }, [communityId])

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/post-tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTagName.trim()) {
      setError("Tag name is required")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/post-tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create tag")
      }

      setNewTagName("")
      setNewTagColor(PRESET_COLORS[0])
      setCreateOpen(false)
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingTag || !newTagName.trim()) {
      setError("Tag name is required")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/post-tags/${editingTag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update tag")
      }

      setEditingTag(null)
      setNewTagName("")
      setNewTagColor(PRESET_COLORS[0])
      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tag")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Are you sure you want to delete this tag? This will remove it from all posts.")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/post-tags/${tagId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete tag")
      }

      fetchTags()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete tag")
    }
  }

  const startEdit = (tag: PostTag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setNewTagName("")
    setNewTagColor(PRESET_COLORS[0])
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading tags...</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Post Tags
          </CardTitle>
          {canManage && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Post Tag</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTag} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagName">Tag Name</Label>
                    <Input
                      id="tagName"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name..."
                      maxLength={30}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTagColor === color ? "border-gray-900" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-16 h-8 p-1"
                      />
                      <span className="text-sm text-gray-500">Custom color</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <Badge style={{ backgroundColor: newTagColor, color: "white" }}>{newTagName || "Tag Name"}</Badge>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Tag"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No post tags yet</p>
            {canManage && <p className="text-xs">Create tags to help organize posts</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-2 rounded-lg border">
                {editingTag?.id === tag.id ? (
                  <form onSubmit={handleUpdateTag} className="flex-1 flex items-center gap-2">
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1"
                      maxLength={30}
                      required
                    />
                    <div className="flex items-center gap-1">
                      {PRESET_COLORS.slice(0, 5).map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border ${
                            newTagColor === color ? "border-gray-900" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                      <Input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-8 h-6 p-0 border-0"
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={submitting}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <Badge style={{ backgroundColor: tag.color, color: "white" }}>{tag.name}</Badge>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => startEdit(tag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
