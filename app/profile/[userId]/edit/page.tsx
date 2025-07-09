"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft, Upload, Trash2, Plus, X, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface SocialLink {
  platform: string
  url: string
}

interface ProfileData {
  user_id: number
  username: string
  display_name: string
  bio: string
  profile_picture_url: string | null
  social_links: SocialLink[]
}

const ALLOWED_PLATFORMS = ["twitter", "youtube", "spotify", "discord", "roblox", "custom"]

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  const { user: currentUser } = useCurrentUser()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (currentUser && currentUser.user_id.toString() !== userId) {
      router.push("/dashboard")
      return
    }
    fetchProfile()
  }, [currentUser, userId, router])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`https://api.loryx.lol/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setDisplayName(data.display_name)
        setBio(data.bio || "")
        setSocialLinks(data.social_links || [])
      } else if (response.status === 404) {
        // Profile doesn't exist, set defaults for creation
        setProfile({
          user_id: Number.parseInt(userId),
          username: currentUser?.username || "",
          display_name: currentUser?.username || "",
          bio: "",
          profile_picture_url: null,
          social_links: [],
        })
        setDisplayName(currentUser?.username || "")
        setBio("")
        setSocialLinks([])
      }
    } catch (err) {
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    if (displayName.length < 3) {
      setError("Display name must be at least 3 characters long")
      setSaving(false)
      return
    }

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
      if (!token) {
        router.push("/login")
        return
      }

      // Ensure social links have lowercase platform names
      const normalizedSocialLinks = socialLinks.map((link) => ({
        ...link,
        platform: link.platform.toLowerCase(),
      }))

      const profileData = {
        display_name: displayName,
        bio: bio || null,
        social_links: normalizedSocialLinks,
      }

      let response
      if (profile && profile.display_name) {
        // Update existing profile
        response = await fetch(`https://api.loryx.lol/users/${userId}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        })
      } else {
        // Create new profile
        response = await fetch(`https://api.loryx.lol/users/${userId}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to save profile")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setSuccess("Profile saved successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
    setUploading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`https://api.loryx.lol/users/${userId}/profile/picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload image")
      }

      const data = await response.json()
      setProfile((prev) => (prev ? { ...prev, profile_picture_url: data.profile_picture_url } : null))
      setSuccess("Profile picture updated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePicture = async () => {
    setError("")
    setUploading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`https://api.loryx.lol/users/${userId}/profile/picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete image")
      }

      setProfile((prev) => (prev ? { ...prev, profile_picture_url: null } : null))
      setSuccess("Profile picture deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image")
    } finally {
      setUploading(false)
    }
  }

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "twitter", url: "" }])
  }

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: value }
    setSocialLinks(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${userId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
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
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.profile_picture_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      disabled={uploading}
                      onClick={() => document.getElementById("picture-upload")?.click()}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </Button>
                    {profile?.profile_picture_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                        disabled={uploading}
                        onClick={handleDeletePicture}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                </div>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                minLength={3}
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself... You can use line breaks and formatting."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">{bio.length}/500 characters</p>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Social Links</Label>
                <Button variant="outline" size="sm" onClick={addSocialLink} className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </div>
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
                  <Button variant="outline" size="sm" onClick={() => removeSocialLink(index)} className="px-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

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

            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Link href={`/profile/${userId}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
