"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Tag, Trash2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface PostTag {
  id: number
  name: string
  color: string
  community_id: number
  created_at: string
}

interface PostTagManagerProps {
  communityId: number
  communityName: string
  isOwner: boolean
}

export function PostTagManager({ communityId, communityName, isOwner }: PostTagManagerProps) {
  const { user } = useCurrentUser()
  const [tags, setTags] = useState<PostTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3B82F6")
  const [submitting, setSubmitting] = useState(false)

  const predefinedColors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#EC4899", // Pink
    "#6B7280", // Gray
  ]

  useEffect(() => {
    fetchTags()
  }, [communityId])

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/communities/${communityId}/tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTags(data)
      } else {
        setError("Failed to load tags")
      }
    } catch (err) {
      setError("Failed to load tags")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/communities/${communityId}/tags`, {
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

      if (response.ok) {
        setNewTagName("")
        setNewTagColor("#3B82F6")
        setIsCreateDialogOpen(false)
        fetchTags()
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to create tag")
      }
    } catch (err) {
      setError("Failed to create tag")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Are you sure you want to delete this tag? This action cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/communities/${communityId}/tags/${tagId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchTags()
      } else {
        setError("Failed to delete tag")
      }
    } catch (err) {
      setError("Failed to delete tag")
    }
  }

  if (!isOwner) {
    return null
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Tag className="h-5 w-5 text-blue-400" />
              Post Tags
            </CardTitle>
            <CardDescription className="text-slate-300">Organize posts with custom tags</CardDescription>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Tag</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Add a new tag for organizing posts in f/{communityName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Tag Name</label>
                  <Input
                    placeholder="Enter tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    maxLength={20}
                  />
                  <p className="text-xs text-slate-400 mt-1">{newTagName.length}/20 characters</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Tag Color</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-12 h-8 rounded border border-slate-600 bg-slate-700 cursor-pointer"
                    />
                    <Badge
                      style={{
                        backgroundColor: newTagColor + "30",
                        borderColor: newTagColor + "50",
                        color: newTagColor,
                      }}
                      className="border"
                    >
                      {newTagName || "Preview"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          newTagColor === color ? "border-white scale-110" : "border-slate-600 hover:border-slate-400"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? "Creating..." : "Create Tag"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-500" />
            <h3 className="text-lg font-medium mb-2 text-slate-300">No tags yet</h3>
            <p className="text-slate-400 mb-4">Create your first tag to help organize posts</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create First Tag
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    style={{
                      backgroundColor: tag.color + "30",
                      borderColor: tag.color + "50",
                      color: tag.color,
                    }}
                    className="border"
                  >
                    {tag.name}
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Created {new Date(tag.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
