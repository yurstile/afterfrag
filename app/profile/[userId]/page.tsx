"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Edit, ExternalLink, Calendar, Globe } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatDate } from "@/utils/date-utils"
import { RecentActivityCard } from "@/components/recent-activity-card"

interface UserProfile {
  user_id: number
  username: string
  display_name: string
  bio: string | null
  profile_picture_url: string | null
  is_online: boolean
  last_online: string | null
  social_links: Array<{ platform: string; url: string }>
  created_at: string
  updated_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = Number.parseInt(params.userId as string)
  const { user: currentUser, loading: currentUserLoading } = useCurrentUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentUser) {
      fetchProfile()
    }
  }, [currentUser, userId])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError("User profile not found")
        } else {
          throw new Error("Failed to fetch profile")
        }
        return
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  if (currentUserLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Profile not found"}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/dashboard">
                <Button variant="outline" className="gap-2 bg-transparent">
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

  const isOwnProfile = currentUser.user_id === userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-wygsedFsbzUPP0F7Z988Qqr7NPP93N.png"
                  alt="Logo"
                  className="h-6 w-6"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Afterfrag
                </span>
              </div>
            </div>
            {isOwnProfile && (
              <Link href={`/profile/${userId}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:border-blue-400 bg-transparent"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
              <CardHeader>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/25">
                      <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.display_name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                        {profile.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {profile.is_online && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl text-white">{profile.display_name}</CardTitle>
                      {profile.is_online && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                          Online
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base text-blue-300 mb-3">@{profile.username}</CardDescription>
                    {profile.bio && (
                      <p className="text-slate-300 whitespace-pre-wrap mb-4 leading-relaxed">{profile.bio}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(profile.created_at)}
                      </div>
                      {profile.last_online && !profile.is_online && (
                        <div>Last seen {formatDate(profile.last_online)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {profile.social_links.length > 0 && (
                <CardContent>
                  <h4 className="font-semibold mb-3 text-white">Social Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.social_links.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-800/30 hover:bg-blue-700/40 border border-blue-500/30 rounded-lg text-sm transition-all duration-200 text-blue-300 hover:text-blue-100 hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        <Globe className="h-4 w-4" />
                        <span>{link.platform}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5 text-blue-400" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-slate-200">{formatDate(profile.created_at)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Status</span>
                  <span
                    className={`flex items-center gap-2 ${profile.is_online ? "text-green-400" : "text-slate-400"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${profile.is_online ? "bg-green-500 animate-pulse" : "bg-slate-500"}`}
                    />
                    {profile.is_online ? "Online" : "Offline"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <RecentActivityCard userId={userId} />
          </div>
        </div>
      </main>
    </div>
  )
}
