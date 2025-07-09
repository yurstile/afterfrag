"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrentUser } from "@/hooks/use-current-user"

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

      const response = await fetch("https://app.afterfrag.com/communities/user/topics", {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading topics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
        <CardHeader>
          <CardTitle>Your Topics</CardTitle>
        </CardHeader>
        <CardContent>
          {topicsData && (
            <div>
              <p>Total Topics: {topicsData.total_topics}</p>
              <ul>
                {topicsData.user_topics.map((topic, index) => (
                  <li key={index}>
                    <Badge>{topic}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
