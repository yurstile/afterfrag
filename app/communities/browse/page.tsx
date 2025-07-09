"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, Plus, TrendingUp, Clock, Star, ArrowLeft } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface Community {
  id: number
  name: string
  description: string | null
  group_picture_url: string | null
  member_count: number
  online_member_count: number
  created_at: string
  updated_at: string
  owner_username: string
  tags: string[]
  is_member?: boolean
}

export default function CommunitiesBrowsePage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [communities, setCommunities] = useState<Community[]>([])
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("members")
  const [tagFilter, setTagFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchCommunities()
    }
  }, [user])

  useEffect(() => {
    filterAndSortCommunities()
  }, [communities, searchQuery, sortBy, tagFilter])

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("https://app.afterfrag.com/communities/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCommunities(data)
      } else {
        setError("Failed to load communities")
      }
    } catch (err) {
      setError("Failed to load communities")
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortCommunities = () => {
    let filtered = communities

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by tag
    if (tagFilter !== "all") {
      filtered = filtered.filter((community) => community.tags.includes(tagFilter))
    }

    // Sort communities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "members":
          return b.member_count - a.member_count
        case "activity":
          return b.online_member_count - a.online_member_count
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredCommunities(filtered)
  }

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchCommunities()
      }
    } catch (err) {
      console.error("Failed to join community:", err)
    }
  }

  const handleLeaveCommunity = async (communityId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/communities/${communityId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchCommunities()
      }
    } catch (err) {
      console.error("Failed to leave community:", err)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading communities...</p>
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
              <Button className="bg-blue-600 hover:bg-blue-700">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allTags = Array.from(new Set(communities.flatMap(c => c.tags || []))).filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
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
            <Link href="/communities/create">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Fragsub
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Browse Communities</h1>
          <p className="text-blue-200">Discover and join gaming communities</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="members" className="text-slate-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Most Members
                    </div>
                  </SelectItem>
                  <SelectItem value="activity" className="text-slate-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Active
                    </div>
                  </SelectItem>
                  <SelectItem value="newest" className="text-slate-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="name" className="text-slate-300 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Name
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-slate-300 hover:text-white">
                    All Tags
                  </SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag} className="text-slate-300 hover:text-white">
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-slate-400 flex items-center">
                {filteredCommunities.length} communities found
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/50">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Communities Grid */}
        {filteredCommunities.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
            <CardContent className="pt-6 text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50 text-slate-500" />
              <h3 className="text-xl font-medium mb-2 text-white">No communities found</h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || tagFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create a community!"}
              </p>
              <Link href="/communities/create">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create First Community
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card
                key={community.id}
                className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-blue-500/30">
                      <AvatarImage src={community.group_picture_url || undefined} alt={community.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-xl">
                        {(community.name || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-white mb-1">
                        <Link href={`/f/${community.name}`} className="hover:text-blue-300 transition-colors">
                          {community.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-blue-300 mb-2">f/{community.name}</CardDescription>
                      {community.tags && community.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {community.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} className="bg-blue-900/30 text-blue-300 border-blue-500/30 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {community.tags.length > 2 && (
                            <Badge className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                              +{community.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                    {community.description || "No description available"}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.member_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>{community.online_member_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {community.is_member ? (
                      <div className="flex gap-2">
                        <Link href={`/f/${community.name}`} className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">Visit Community</Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => handleLeaveCommunity(community.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                          Leave
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleJoinCommunity(community.id)}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
                      >
                        Join Community
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
