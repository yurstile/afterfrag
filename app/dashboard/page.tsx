"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { MessageSquare, Home, Users, ChevronDown, Settings, LogOut, ExternalLink, RefreshCw, Plus } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { PostCard } from "@/components/post-card"

interface Community {
  id: number
  name: string
  group_picture_url: string | null
  member_count: number
  online_member_count: number
}

interface RecommendedPost {
  id: number
  community_id: number
  user_id: number
  title: string
  content: string
  post_tags: any[]
  like_count: number
  view_count: number
  created_at: string
  updated_at: string
  media: any[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  comment_count: number
  community_name: string
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [recommendedPosts, setRecommendedPosts] = useState<RecommendedPost[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [communitiesLoading, setCommunitiesLoading] = useState(true)
  const [resourcesOpen, setResourcesOpen] = useState(true)
  const [communitiesOpen, setCommunitiesOpen] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserCommunities()
      fetchRecommendedPosts()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user) return

      const response = await fetch(`https://api.loryx.lol/users/${user.user_id}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const profileData = await response.json()
        setUserProfile(profileData)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const fetchUserCommunities = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch("https://api.loryx.lol/communities/user/joined", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserCommunities(data)
      }
    } catch (error) {
      console.error("Failed to fetch user communities:", error)
    } finally {
      setCommunitiesLoading(false)
    }
  }

  const fetchRecommendedPosts = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user) return

      const response = await fetch(`https://api.loryx.lol/users/${user.user_id}/home/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendedPosts(data)
      }
    } catch (error) {
      console.error("Failed to fetch recommended posts:", error)
    } finally {
      setFeedLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  const handleLike = async (postId: number, value: 1 | -1) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await fetch(`https://api.loryx.lol/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      })

      fetchRecommendedPosts() // Refresh posts
    } catch (err) {
      console.error("Failed to like post:", err)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchRecommendedPosts() // Refresh posts
      }
    } catch (err) {
      console.error("Failed to delete post:", err)
    }
  }

  const refreshFeed = () => {
    setFeedLoading(true)
    fetchRecommendedPosts()
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

  // Safe fallbacks for user data
  const displayName = userProfile?.display_name || user?.display_name || user?.username || "User"
  const username = user?.username || "user"
  const profilePictureUrl = userProfile?.profile_picture_url || user?.profile_picture_url

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">Afterfrag</span>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={profilePictureUrl || undefined} alt={displayName} />
                    <AvatarFallback className="text-xs">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.user_id}`} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen sticky top-12">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <nav className="space-y-1">
              <Button variant="default" className="w-full justify-start gap-2" asChild>
                <Link href="/dashboard">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/communities/browse">
                  <Users className="h-4 w-4" />
                  Communities
                </Link>
              </Button>
            </nav>

            {/* User Communities */}
            <Collapsible open={communitiesOpen} onOpenChange={setCommunitiesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-8 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  Communities
                  <ChevronDown className={`h-4 w-4 transition-transform ${communitiesOpen ? "" : "rotate-180"}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
                  <Link href="/communities/create">
                    <Plus className="h-4 w-4" />
                    Create Fragsub
                  </Link>
                </Button>
                {communitiesLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : userCommunities.length === 0 ? (
                  <p className="text-xs text-gray-500 px-2 py-1">No communities joined</p>
                ) : (
                  userCommunities.map((community) => (
                    <Button
                      key={community.id}
                      variant="ghost"
                      className="w-full justify-start gap-2 h-auto p-2"
                      asChild
                    >
                      <Link href={`/f/${community.name}`}>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={community.group_picture_url || undefined} alt={community.name} />
                          <AvatarFallback className="text-xs">{community.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">f/{community.name}</span>
                      </Link>
                    </Button>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Resources */}
            <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-8 text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  Resources
                  <ChevronDown className={`h-4 w-4 transition-transform ${resourcesOpen ? "" : "rotate-180"}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
                  <a href="https://discord.gg/afterfrag" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Discord
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
                  <a href="https://twitter.com/afterfrag" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Twitter
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
                  <Link href="/terms">Terms of Service</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-sm" asChild>
                  <Link href="/privacy">Privacy Policy</Link>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {displayName}!</h1>
              <p className="text-gray-600">Here's what's happening in your communities</p>
            </div>

            {/* Feed Controls */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Your Feed</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshFeed}
                disabled={feedLoading}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${feedLoading ? "animate-spin" : ""}`} />
                Refresh Feed
              </Button>
            </div>

            {/* Posts Feed */}
            {feedLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                <p>Loading your personalized feed...</p>
              </div>
            ) : recommendedPosts.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No posts in your feed</h3>
                  <p className="text-gray-600 mb-4">Join some communities to see personalized content here!</p>
                  <Link href="/communities/browse">
                    <Button>Browse Communities</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recommendedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    {...post}
                    showCommunityName={true}
                    onLike={(value) => handleLike(post.id, value)}
                    onDelete={() => handleDelete(post.id)}
                    onEdit={() => {
                      // TODO: Implement edit functionality
                    }}
                  />
                ))}

                {/* Load More Button */}
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={refreshFeed}
                    disabled={feedLoading}
                    className="gap-2 bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${feedLoading ? "animate-spin" : ""}`} />
                    Load More Posts
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
