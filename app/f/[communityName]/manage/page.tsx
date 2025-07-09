"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ArrowLeft, Settings, Save, Plus, X, Loader2, Upload, Trash2, ImageIcon } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface SocialLink {
  platform: string
  url: string
}

interface CommunityDetail {
  id: number
  name: string
  description: string
  tags: string[]
  owner_id: number
  owner_username: string
  rules: string[] | null
  social_links: SocialLink[] | null
  banner_picture_url: string | null
  group_picture_url: string | null
}

const AVAILABLE_TOPICS = [
  "Science",
  "Technology",
  "Gaming",
  "Movies & TV Shows",
  "Music",
  "Sports",
  "Health & Fitness",
  "Food & Cooking",
  "Travel",
  "Fashion",
  "Art & Design",
  "Photography",
  "Books & Literature",
  "History",
  "Politics",
  "Finance & Investing",
  "Education",
  "Nature & Environment",
  "Space & Astronomy",
  "DIY & Crafts",
  "Comedy",
  "Memes & Humor",
  "Anime & Manga",
  "Cars & Motorcycles",
  "Relationships & Dating",
  "Mental Health",
  "Meditation & Mindfulness",
  "Business & Entrepreneurship",
  "Science Fiction & Fantasy",
  "True Crime",
  "Parenting",
  "Gardening",
  "Fitness Challenges",
  "Coding & Programming",
  "Pets & Animals",
  "Photography Tips",
  "Gaming Strategies",
  "Streaming & Podcasts",
  "Startups & Tech News",
  "Productivity Hacks",
  "Environment & Climate Change",
  "Art Tutorials",
  "Social Justice",
  "Home Improvement",
  "Career Advice",
  "Makeup & Beauty",
  "Language Learning",
  "Philosophy",
  "Festivals & Events",
  "Motivational Stories",
]

const ALLOWED_PLATFORMS = ["twitter", "youtube", "spotify", "discord", "roblox", "custom"]

export default function ManageCommunityPage() {
  const params = useParams()
  const communityName = params.communityName as string
  const { user, loading: userLoading } = useCurrentUser()
  const [community, setCommunity] = useState<CommunityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [rules, setRules] = useState<string[]>([])
  const [newRule, setNewRule] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  // File input refs
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const pictureInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchCommunity()
    }
  }, [user, communityName])

  const fetchCommunity = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(`https://api.loryx.lol/communities/f/${communityName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch community")
      }

      const data = await response.json()
      setCommunity(data)

      // Check if user is owner
      if (data.owner_id !== user?.user_id) {
        setError("You don't have permission to manage this community")
        return
      }

      // Set form data
      setName(data.name)
      setDescription(data.description)
      setSelectedTags(data.tags || [])
      setRules(data.rules || [])
      setSocialLinks(data.social_links || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load community")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    // Validate social links
    for (const link of socialLinks) {
      if (!link.platform || !link.url) {
        setError("All social links must have both platform and URL")
        setSaving(false)
        return
      }
      if (!ALLOWED_PLATFORMS.includes(link.platform.toLowerCase())) {
        setError(`Invalid platform: ${link.platform}. Allowed platforms: ${ALLOWED_PLATFORMS.join(", ")}`)
        setSaving(false)
        return
      }
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token || !community) return

      // Ensure social links have lowercase platform names
      const normalizedSocialLinks = socialLinks.map((link) => ({
        ...link,
        platform: link.platform.toLowerCase(),
      }))

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name !== community.name ? name : undefined,
          description: description !== community.description ? description : undefined,
          tags: JSON.stringify(selectedTags) !== JSON.stringify(community.tags) ? selectedTags : undefined,
          rules: JSON.stringify(rules) !== JSON.stringify(community.rules) ? rules : undefined,
          social_links:
            JSON.stringify(normalizedSocialLinks) !== JSON.stringify(community.social_links)
              ? normalizedSocialLinks
              : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update community")
      }

      setSuccess("Community updated successfully!")
      fetchCommunity() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update community")
    } finally {
      setSaving(false)
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !community) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    setError("")
    setUploadingBanner(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload banner")
      }

      const data = await response.json()
      setCommunity((prev) => (prev ? { ...prev, banner_picture_url: data.banner_picture_url } : null))
      setSuccess("Banner uploaded successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload banner")
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleBannerDelete = async () => {
    if (!community) return

    setUploadingBanner(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/banner`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete banner")
      }

      setCommunity((prev) => (prev ? { ...prev, banner_picture_url: null } : null))
      setSuccess("Banner deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete banner")
    } finally {
      setUploadingBanner(false)
    }
  }

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !community) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    setError("")
    setUploadingPicture(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/group-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload picture")
      }

      const data = await response.json()
      setCommunity((prev) => (prev ? { ...prev, group_picture_url: data.group_picture_url } : null))
      setSuccess("Group picture uploaded successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload picture")
    } finally {
      setUploadingPicture(false)
    }
  }

  const handlePictureDelete = async () => {
    if (!community) return

    setUploadingPicture(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/group-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete picture")
      }

      setCommunity((prev) => (prev ? { ...prev, group_picture_url: null } : null))
      setSuccess("Group picture deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete picture")
    } finally {
      setUploadingPicture(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addRule = () => {
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      setRules((prev) => [...prev, newRule.trim()])
      setNewRule("")
    }
  }

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index))
  }

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "twitter", url: "" }])
  }

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    setSocialLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index))
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href={`/f/${communityName}`}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Community
                </Button>
              </Link>
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
              <Link href={`/f/${communityName}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Community
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Afterfrag</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage f/{communityName}</h1>
          <p className="text-gray-600">Update your community settings and information</p>
        </div>

        <div className="space-y-6">
          {/* Community Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Community Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Image */}
              <div className="space-y-4">
                <Label>Banner Image</Label>
                {community?.banner_picture_url && (
                  <div className="w-full h-48 overflow-hidden rounded-lg border">
                    <img
                      src={community.banner_picture_url || "/placeholder.svg"}
                      alt="Community banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    disabled={uploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Banner
                  </Button>
                  {community?.banner_picture_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      disabled={uploadingBanner}
                      onClick={handleBannerDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Banner
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Recommended: 1200x400px, JPG or PNG, max 5MB</p>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </div>

              {/* Group Picture */}
              <div className="space-y-4">
                <Label>Group Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={community?.group_picture_url || undefined} alt={community?.name} />
                    <AvatarFallback className="text-xl">{community?.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        disabled={uploadingPicture}
                        onClick={() => pictureInputRef.current?.click()}
                      >
                        {uploadingPicture ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Upload Picture
                      </Button>
                      {community?.group_picture_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          disabled={uploadingPicture}
                          onClick={handlePictureDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Picture
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Square image recommended, JPG or PNG, max 5MB</p>
                  </div>
                  <input
                    ref={pictureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePictureUpload}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">f/</span>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-8"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Describe your community... You can use line breaks and formatting."
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">{description.length}/2000 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Select tags that describe your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="default" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {AVAILABLE_TOPICS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer p-2 text-center justify-center transition-all hover:scale-105 ${
                      selectedTags.includes(tag)
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "hover:bg-orange-50 hover:border-orange-300"
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Community Rules</CardTitle>
              <CardDescription>Set guidelines for your community members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.length > 0 && (
                <div className="space-y-2">
                  {rules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500 mt-0.5">{index + 1}.</span>
                      <span className="text-sm flex-1 whitespace-pre-wrap">{rule}</span>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="Add a community rule..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                />
                <Button type="button" onClick={addRule} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Add social media or website links for your community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Select value={link.platform} onValueChange={(value) => updateSocialLink(index, "platform", value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSocialLink(index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={addSocialLink}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Social Link
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
