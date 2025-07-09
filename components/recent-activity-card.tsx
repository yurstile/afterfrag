"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, FileText, ChevronRight } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import Link from "next/link"

interface RecentActivityItem {
  type: "post" | "comment"
  created_at: string
  group_name?: string
  group_logo_url?: string
  comment_count?: number
  post?: {
    id: number
    title: string
    community_name: string
    like_count: number
    comment_count: number
  }
  comment?: {
    id: number
    content: string
    post_id: number
    post_title: string
    community_name: string
    like_count: number
  }
}

interface RecentActivityResponse {
  items: RecentActivityItem[]
  total: number
  page: number
  page_size: number
}

interface RecentActivityCardProps {
  userId: number
}

export function RecentActivityCard({ userId }: RecentActivityCardProps) {
  const [activity, setActivity] = useState<RecentActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRecentActivity()
  }, [userId])

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/users/${userId}/profile/recent-activity?page=1&page_size=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivity(data)
      } else {
        throw new Error("Failed to fetch recent activity")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recent activity")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {!activity || activity.items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Posts and comments will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 border border-transparent hover:border-blue-500/20"
              >
                <div className="flex-shrink-0 mt-1">
                  {item.type === "post" ? (
                    <FileText className="h-4 w-4 text-blue-400" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={item.type === "post" ? "default" : "secondary"}
                      className={`text-xs ${
                        item.type === "post"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                          : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                      }`}
                    >
                      {item.type === "post" ? "Post" : "Comment"}
                    </Badge>
                    <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                  </div>

                  {item.type === "post" && item.post ? (
                    <div>
                      <Link
                        href={`/posts/${item.post.id}`}
                        className="text-sm font-medium hover:text-blue-300 transition-colors text-slate-200 line-clamp-2"
                      >
                        {item.post.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-2">
                        {item.group_logo_url && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={item.group_logo_url || "/placeholder.svg"}
                              alt={item.group_name || "Community"}
                            />
                            <AvatarFallback className="text-xs bg-slate-600">
                              {(item.group_name || "C").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {item.group_name && <span>f/{item.group_name}</span>}
                          <span>{item.post.like_count} likes</span>
                          <span>{item.comment_count || item.post.comment_count} comments</span>
                        </div>
                      </div>
                    </div>
                  ) : item.comment ? (
                    <div>
                      <p className="text-sm text-slate-300 line-clamp-2 mb-1">{item.comment.content}</p>
                      <Link
                        href={`/posts/${item.comment.post_id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        on "{item.comment.post_title || 'Untitled post'}"
                      </Link>
                      <div className="flex items-center gap-3 mt-2">
                        {item.group_logo_url && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={item.group_logo_url || "/placeholder.svg"}
                              alt={item.group_name || "Community"}
                            />
                            <AvatarFallback className="text-xs bg-slate-600">
                              {(item.group_name || "C").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          {item.group_name && <span>f/{item.group_name}</span>}
                          <span>{item.comment.like_count} likes</span>
                          <span>{item.comment_count} comments on post</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
