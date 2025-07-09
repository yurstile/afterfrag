"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft, Users, Search, TrendingUp, Star, Plus } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

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
  rules: string[] | null
  social_links: Array<{ platform: string; url: string }> | null
}

export default function BrowseCommunitiesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([])
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"recommended" | "trending" | "all">("recommended")
  const { toast } = useToast()

  const [community, setCommunity] = useState<Community | null>(null) // Declare community variable

  useEffect(() => {
    if (user) {
      fetchCommunities()
    }
  }, [user, activeTab])

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      setLoading(true)

      if (activeTab === "recommended") {
        // Fetch recommended communities
        const response = await fetch("https://api.loryx.lol/browse/communities/recommended?limit=20", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setRecommendedCommunities(data)
        } else if (response.status === 400) {
          // User hasn't completed onboarding
          window.location.href = "/onboarding"
          return
        }
      } else if (activeTab === "trending") {
        // Fetch trending communities
        const response = await fetch("https://api.loryx.lol/browse/communities/trending?limit=20", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTrendingCommunities(data)
        }
      } else {
        // Fetch all communities with search
        let url = "https://api.loryx.lol/communities/?limit=50"
        if (searchQuery) {
          url = `https://api.loryx.lol/communities/?search=${encodeURIComponent(searchQuery)}&limit=50`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCommunities(data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities")
    } finally {
      setLoading(false)
    }
  }

  const joinCommunity = async (communityId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://api.loryx.lol/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Refresh communities to update member count
        fetchCommunities()
        const communityData = getCurrentCommunities().find((c) => c.id === communityId)
        if (communityData) {
          toast({
            title: "Success",
            description: `Successfully joined f/${communityData.name}!`,
          })
        }
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to join community")
        toast({
          title: "Error",
          description: errorData.detail || "Failed to join community",
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("Failed to join community")
    }
  }

  const getCurrentCommunities = () => {
    switch (activeTab) {
      case "recommended":
        return recommendedCommunities
      case "trending":
        return trendingCommunities
      default:
        return communities
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
          <h1 className="text-3xl font-bold mb-2">Browse Fragsubs</h1>
          <p className="text-gray-600">Discover communities that match your interests</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "recommended" ? "default" : "outline"}
            onClick={() => setActiveTab("recommended")}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Recommended
          </Button>
          <Button
            variant={activeTab === "trending" ? "default" : "outline"}
            onClick={() => setActiveTab("trending")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            All Fragsubs
          </Button>
        </div>

        {/* Search Bar (only for "all" tab) */}
        {activeTab === "all" && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Fragsubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && fetchCommunities()}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p>Loading Fragsubs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentCommunities().map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {community.group_picture_url && (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={community.group_picture_url || "/placeholder.svg"} alt={community.name} />
                          <AvatarFallback>{community.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">f/{community.name}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          by @{community.owner_username}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {community.member_count}
                      <span className="text-green-600 ml-1">• {community.online_member_count} online</span>
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
                    <Button
                      size="sm"
                      onClick={() => joinCommunity(community.id)}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && getCurrentCommunities().length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Fragsubs found</h3>
            <p className="text-sm text-gray-600 mb-4">
              {activeTab === "recommended"
                ? "Complete your onboarding to get personalized recommendations"
                : "Try adjusting your search or create a new Fragsub"}
            </p>
            <Link href="/communities/create">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Fragsub
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
