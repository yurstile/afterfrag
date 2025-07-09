"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageSquare,
  ArrowLeft,
  Users,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  ExternalLink,
  Globe,
} from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatDate } from "@/utils/date-utils"
import { PostCard } from "@/components/post-card"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { PostTagManager } from "@/components/post-tag-manager"
import { useToast } from "@/hooks/use-toast"

interface CommunityMember {
  user_id: number
  username: string
  display_name: string
  role: "owner" | "moderator" | "member"
  joined_at: string
  profile_picture_url: string | null
}

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
  staff_members: CommunityMember[]
  member_count: number
  online_member_count: number
  created_at: string
  updated_at: string
  banner_picture_url: string | null
  group_picture_url: string | null
  rules: string[] | null
  social_links: SocialLink[] | null
}

export default function CommunityDetailPage() {
  const params = useParams()
  const communityName = params.communityName as string
  const { user, loading: userLoading } = useCurrentUser()
  const [community, setCommunity] = useState<CommunityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [postTags, setPostTags] = useState<any[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"newest" | "most_liked" | "hottest">("newest")
  const [membershipLoading, setMembershipLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchCommunity()
    }
  }, [user, communityName])

  useEffect(() => {
    if (community && user) {
      fetchPosts()
      fetchPostTags()
      checkMembership()
    }
  }, [community, sortBy, user])

  const checkMembership = async () => {
    if (!community || !user) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/is-member`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsJoined(data.is_member)

        // Check if user is staff member for role
        const staffMember = community.staff_members.find((member) => member.user_id === user.user_id)
        setUserRole(staffMember?.role || null)
      }
    } catch (err) {
      console.error("Failed to check membership:", err)
    }
  }

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
        if (response.status === 404) {
          setError("Fragsub not found")
        } else {
          throw new Error("Failed to fetch Fragsub")
        }
        return
      }

      const data = await response.json()
      setCommunity(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Fragsub")
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    if (!community) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/posts/community/${community.id}?sort=${sortBy}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err)
    } finally {
      setPostsLoading(false)
    }
  }

  const fetchPostTags = async () => {
    if (!community) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/post-tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPostTags(data)
      }
    } catch (err) {
      console.error("Failed to fetch post tags:", err)
    }
  }

  const joinCommunity = async () => {
    if (!community || membershipLoading) return

    setMembershipLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsJoined(true)
        await fetchCommunity() // Refresh community data
        toast({
          title: "Success",
          description: `Successfully joined f/${community.name}!`,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to join Fragsub")
        toast({
          title: "Error",
          description: errorData.detail || "Failed to join Fragsub",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Failed to join Fragsub")
      toast({
        title: "Error",
        description: "Failed to join Fragsub",
        variant: "destructive",
      })
    } finally {
      setMembershipLoading(false)
    }
  }

  const leaveCommunity = async () => {
    if (!community || membershipLoading) return

    if (!confirm(`Are you sure you want to leave f/${community.name}?`)) {
      return
    }

    setMembershipLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${community.id}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsJoined(false)
        setUserRole(null)
        await fetchCommunity() // Refresh community data
        toast({
          title: "Success",
          description: `Left f/${community.name}`,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to leave Fragsub")
        toast({
          title: "Error",
          description: errorData.detail || "Failed to leave Fragsub",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Failed to leave Fragsub")
      toast({
        title: "Error",
        description: "Failed to leave Fragsub",
        variant: "destructive",
      })
    } finally {
      setMembershipLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-600" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="default" className="bg-yellow-600">
            Owner
          </Badge>
        )
      case "moderator":
        return (
          <Badge variant="default" className="bg-blue-600">
            Moderator
          </Badge>
        )
      default:
        return <Badge variant="secondary">Fragger</Badge>
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading Fragsub...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-blue-200">Please log in to continue</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/communities/browse">
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
            <div className="flex items-center gap-2">
              {userRole === "owner" && (
                <Link href={`/f/${community.name}/manage`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent border-blue-500/50 text-blue-300 hover:bg-blue-800/50"
                  >
                    <Settings className="h-4 w-4" />
                    Manage
                  </Button>
                </Link>
              )}
              {isJoined ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={leaveCommunity}
                  disabled={membershipLoading}
                  className="gap-2"
                >
                  <UserMinus className="h-4 w-4" />
                  {membershipLoading ? "Leaving..." : "Leave"}
                </Button>
              ) : (
                <Button
                  onClick={joinCommunity}
                  disabled={membershipLoading}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <UserPlus className="h-4 w-4" />
                  {membershipLoading ? "Joining..." : "Join"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
              {/* Community Banner */}
              {community.banner_picture_url && (
                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={community.banner_picture_url || "/placeholder.svg"}
                    alt={`${community.name} banner`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Community Group Picture */}
                    {community.group_picture_url && (
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={community.group_picture_url || "/placeholder.svg"} alt={community.name} />
                        <AvatarFallback className="text-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                          {community.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-3xl mb-2 text-white">f/{community.name}</CardTitle>
                      <CardDescription className="text-base text-blue-300">
                        Created by @{community.owner_username} • {formatDate(community.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Users className="h-5 w-5" />
                    {community.member_count}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-slate-300 mb-6 whitespace-pre-wrap">{community.description}</div>

                {community.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {community.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-blue-800/30 text-blue-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Links */}
                {community.social_links && community.social_links.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-white">Community Links</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.social_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-800/30 hover:bg-blue-700/40 border border-blue-500/30 rounded-lg text-sm transition-colors text-blue-300 hover:text-blue-100 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                          <Globe className="h-4 w-4" />
                          <span>{link.platform}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50 text-red-300">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Posts section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Posts</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-1 border rounded-md text-sm bg-slate-700/50 text-white border-blue-500/30"
                      >
                        <option value="newest">Newest</option>
                        <option value="most_liked">Most Liked</option>
                        <option value="hottest">Hottest</option>
                      </select>
                      {isJoined && (
                        <CreatePostDialog
                          communityId={community.id}
                          communityName={community.name}
                          availableTags={postTags}
                          onPostCreated={() => {
                            fetchPosts()
                            fetchCommunity()
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
                      <p className="text-blue-200">Loading posts...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No posts yet in this Fragsub</p>
                      <p className="text-xs">Be the first to share something!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          {...post}
                          community_name={community.name}
                          onLike={async (value) => {
                            const token = localStorage.getItem("access_token")
                            if (!token) return

                            await fetch(`https://api.loryx.lol/posts/${post.id}/like`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ value }),
                            })
                            fetchPosts()
                          }}
                          onEdit={() => {
                            // TODO: Implement edit functionality
                          }}
                          onDelete={async () => {
                            if (!confirm("Are you sure you want to delete this post?")) return

                            const token = localStorage.getItem("access_token")
                            if (!token) return

                            const response = await fetch(`https://api.loryx.lol/posts/${post.id}`, {
                              method: "DELETE",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            })

                            if (response.ok) {
                              fetchPosts()
                              fetchCommunity()
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Staff Members */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5" />
                  Staff ({community.staff_members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {community.staff_members.map((member) => (
                    <Link
                      key={member.user_id}
                      href={`/profile/${member.user_id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.profile_picture_url || undefined} alt={member.display_name} />
                          <AvatarFallback className="text-xs bg-slate-600">
                            {member.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{member.display_name}</p>
                          <p className="text-xs text-slate-400">@{member.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {getRoleBadge(member.role)}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Rules */}
            {community.rules && community.rules.length > 0 && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
                <CardHeader>
                  <CardTitle className="text-white">Community Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {community.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-sm font-medium text-slate-400 mt-0.5">{index + 1}.</span>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{rule}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Info */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="text-slate-200">{formatDate(community.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fraggers</span>
                  <span className="text-slate-200">{community.member_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Online Now</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {community.online_member_count} online
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner</span>
                  <Link href={`/profile/${community.owner_id}`} className="text-blue-400 hover:text-blue-300">
                    @{community.owner_username}
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Post Tag Manager */}
            {(userRole === "owner" || userRole === "moderator") && (
              <PostTagManager communityId={community.id} communityName={community.name} canManage={true} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
