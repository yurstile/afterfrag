"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft, Users, Crown, Plus, Settings } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Community {
  id: number
  name: string
  description: string
  tags: string[]
  owner_id: number
  owner_username: string
  member_count: number
  online_member_count: number
  created_at: string
  updated_at: string
  banner_picture_url: string | null
  group_picture_url: string | null
}

export default function MyCommunitiesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchMyCommunities()
    }
  }, [user])

  const fetchMyCommunities = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("https://api.loryx.lol/communities/user/joined", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCommunities(data)
      } else {
        throw new Error("Failed to fetch communities")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities")
    } finally {
      setLoading(false)
    }
  }

  const leaveCommunity = async (communityId: number, communityName: string) => {
    if (!confirm(`Are you sure you want to leave f/${communityName}?`)) {
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from local state
        setCommunities((prev) => prev.filter((c) => c.id !== communityId))
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to leave community")
      }
    } catch (err) {
      setError("Failed to leave community")
    }
  }

  const getRoleIcon = (community: Community) => {
    if (community.owner_id === user?.user_id) {
      return <Crown className="h-4 w-4 text-yellow-600" title="Owner" />
    }
    // Note: We'd need to fetch member role info to show moderator badge
    return null
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Afterfrag</span>
              </div>
            </div>
            <Link href="/communities/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Fragsub
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Fragsubs</h1>
          <p className="text-gray-600">Fragsubs you've joined or created</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Loading your Fragsubs...</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Fragsubs yet</h3>
            <p className="text-sm text-gray-600 mb-4">Join some Fragsubs or create your own to get started!</p>
            <div className="flex gap-4 justify-center">
              <Link href="/communities/browse">
                <Button variant="outline">Browse Fragsubs</Button>
              </Link>
              <Link href="/communities/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Fragsub
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {community.group_picture_url && (
                          <Avatar className="h-12 w-12 mr-3">
                            <AvatarImage src={community.group_picture_url || "/placeholder.svg"} alt={community.name} />
                            <AvatarFallback>{community.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <CardTitle className="text-lg">f/{community.name}</CardTitle>
                        {getRoleIcon(community)}
                      </div>
                      <CardDescription className="text-sm text-gray-600">
                        by @{community.owner_username}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {community.member_count}
                      <span className="text-green-600 ml-1">({community.online_member_count} online)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{community.description}</p>

                  {community.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {community.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{community.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/f/${community.name}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View
                      </Button>
                    </Link>
                    {community.owner_id === user.user_id ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 bg-transparent"
                        onClick={() => {
                          /* Navigate to manage community */
                        }}
                      >
                        <Settings className="h-3 w-3" />
                        Manage
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => leaveCommunity(community.id, community.name)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
