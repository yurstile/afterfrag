"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft, Tag, Users } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { Logo } from "@/components/logo"

interface TopicSource {
  community_name: string
  community_id: number
}

interface CommunityData {
  community_id: number
  topics: string[]
}

interface UserTopicsData {
  user_topics: string[]
  total_topics: number
  topic_sources: Record<string, TopicSource[]>
  communities: Record<string, CommunityData>
}

export default function UserTopicsPage() {
  const params = useParams()
  const userId = params.userId as string
  const { user: currentUser } = useCurrentUser()
  const [topicsData, setTopicsData] = useState<UserTopicsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentUser && currentUser.user_id.toString() === userId) {
      fetchUserTopics()
    } else {
      setError("You can only view your own topics")
      setLoading(false)
    }
  }, [currentUser, userId])

  const fetchUserTopics = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("https://api.loryx.lol/communities/user/topics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user topics")
      }

      const data = await response.json()
      setTopicsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading topics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href={`/profile/${userId}`}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
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
              <Link href={`/profile/${userId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-secondary text-glow-secondary" />
                <Logo size={28} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Topics</h1>
          <p className="text-gray-600">Topics from your joined Fragsubs ({topicsData?.total_topics || 0} total)</p>
        </div>

        {topicsData && topicsData.user_topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicsData.user_topics.map((topic) => (
              <Card key={topic} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-4 w-4 text-orange-600" />
                    {topic}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">From Fragsubs:</p>
                    <div className="space-y-1">
                      {topicsData.topic_sources[topic]?.map((source) => (
                        <Link key={source.community_id} href={`/f/${source.community_name}`} className="block">
                          <Badge
                            variant="outline"
                            className="w-full justify-start gap-2 p-2 hover:bg-orange-50 hover:border-orange-300 cursor-pointer bg-transparent"
                          >
                            <Users className="h-3 w-3" />
                            f/{source.community_name}
                          </Badge>
                        </Link>
                      )) || (
                        <Badge variant="secondary" className="text-xs">
                          No source found
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No topics yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join some Fragsubs to automatically get topics added to your preferences!
              </p>
              <Link href="/communities/browse">
                <Button className="gap-2">
                  <Users className="h-4 w-4" />
                  Browse Fragsubs
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Communities Summary */}
        {topicsData && Object.keys(topicsData.communities).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Fragsubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(topicsData.communities).map(([communityName, communityData]) => (
                  <Link key={communityData.community_id} href={`/f/${communityName}`} className="block">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-2">f/{communityName}</h4>
                      <div className="flex flex-wrap gap-1">
                        {communityData.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {communityData.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{communityData.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
