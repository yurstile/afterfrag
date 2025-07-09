"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ArrowLeft, Plus, X, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

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

interface SocialLink {
  platform: string
  url: string
}

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [rules, setRules] = useState<string[]>([])
  const [newRule, setNewRule] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()])
      setCustomTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (name.length < 3) {
      setError("Fragsub name must be at least 3 characters long")
      return
    }

    if (description.length < 10) {
      setError("Description must be at least 10 characters long")
      return
    }

    if (selectedTags.length === 0) {
      setError("Please select at least one tag")
      return
    }

    // Validate social links
    for (const link of socialLinks) {
      if (!link.platform || !link.url) {
        setError("All social links must have both platform and URL")
        return
      }
      if (!ALLOWED_PLATFORMS.includes(link.platform.toLowerCase())) {
        setError(`Invalid platform: ${link.platform}. Allowed platforms: ${ALLOWED_PLATFORMS.join(", ")}`)
        return
      }
    }

    setError("")
    setLoading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      // Ensure social links have lowercase platform names
      const normalizedSocialLinks = socialLinks.map((link) => ({
        ...link,
        platform: link.platform.toLowerCase(),
      }))

      const response = await fetch("https://api.loryx.lol/communities/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          tags: selectedTags,
          rules: rules.length > 0 ? rules : null,
          social_links:
            normalizedSocialLinks.filter((link) => link.platform && link.url).length > 0
              ? normalizedSocialLinks.filter((link) => link.platform && link.url)
              : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to create Fragsub")
      }

      const community = await response.json()
      router.push(`/f/${community.name}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Fragsub")
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/communities/browse">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Browse
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Afterfrag</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Fragsub</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Fragsub Name</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">f/</span>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="mycommunity"
                    className="pl-8"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-gray-500">Choose a unique name for your Fragsub (3-50 characters)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your Fragsub is about... You can use line breaks and formatting."
                  rows={6}
                  required
                  minLength={10}
                  maxLength={2000}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">{description.length}/2000 characters</p>
              </div>

              <div className="space-y-4">
                <Label>Tags</Label>
                <p className="text-sm text-gray-600">
                  Select tags that best describe your Fragsub to help Fraggers find it
                </p>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="default" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  />
                  <Button type="button" onClick={addCustomTag} variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Available Tags */}
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
              </div>

              {/* Community Rules */}
              <div className="space-y-4">
                <Label>Community Rules (Optional)</Label>
                <p className="text-sm text-gray-600">Set clear guidelines for your community members</p>

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
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label>Social Links (Optional)</Label>
                <p className="text-sm text-gray-600">Add social media or website links for your community</p>

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
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Fragsub...
                    </>
                  ) : (
                    "Create Fragsub"
                  )}
                </Button>
                <Link href="/communities/browse">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
