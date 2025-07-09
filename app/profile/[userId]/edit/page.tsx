"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Save, Upload, Trash2, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface UserProfile {
  user_id: number
  username: string
  display_name: string
  bio: string | null
  profile_picture_url: string | null
}

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = Number.parseInt(params.userId as string)
  const { user, loading: userLoading } = useCurrentUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (user && user.user_id !== userId) {
      router.push(`/profile/${userId}`)
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, userId, router])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
      setDisplayName(data.display_name || "")
      setBio(data.bio || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: displayName,
          bio: bio,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      fetchProfile()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile-picture`, {
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
      setProfile((prev) => (prev ? { ...prev, profile_picture_url: data.profile_picture_url } : null))
      setSuccess("Profile picture updated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload picture")
    } finally {
      setUploading(false)
    }
  }

  const handlePictureDelete = async () => {
    setUploading(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete picture")
      }

      setProfile((prev) => (prev ? { ...prev, profile_picture_url: null } : null))
      setSuccess("Profile picture deleted successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete picture")
    } finally {
      setUploading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertDescription className="text-red-300">Profile not found</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/profile/${userId}`}>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-300 hover:text-white hover:bg-slate-700">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Afterfrag" className="h-8 w-8" />
                <span className="text-lg font-bold text-white">Afterfrag</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
          <p className="text-slate-400">Update your profile information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.display_name} />
                  <AvatarFallback className="text-xl bg-slate-700 text-white">
                    {profile.display_name?.charAt(0)?.toUpperCase() ||
                      profile.username?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePictureUpload}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label htmlFor="profile-picture">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          Upload Picture
                        </span>
                      </Button>
                    </label>
                    {profile.profile_picture_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        disabled={uploading}
                        onClick={handlePictureDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Picture
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Square image recommended, JPG or PNG, max 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profile.username}
                  disabled
                  className="bg-slate-700/50 border-slate-600 text-slate-400"
                />
                <p className="text-xs text-slate-400">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={50}
                />
                <p className="text-xs text-slate-400">{displayName.length}/50 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  className="resize-none bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-400">{bio.length}/500 characters</p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-900/20">
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  )
}
