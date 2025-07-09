"use client"

import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface RecentActivityItem {
  type: "post" | "comment"
  created_at: string
  post?: any
  comment?: any
}

interface RecentActivityResponse {
  items: RecentActivityItem[]
  total: number
  page: number
  page_size: number
}

export function useRecentActivity(page = 1, pageSize = 10) {
  const { user } = useCurrentUser()
  const [activity, setActivity] = useState<RecentActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No authentication token")

      const response = await fetch(
        `https://api.loryx.lol/users/${user.user_id}/profile/recent-activity?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity")
      }

      const data = await response.json()
      setActivity(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recent activity")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [user, page, pageSize])

  const refresh = () => {
    fetchActivity()
  }

  return {
    activity,
    loading,
    error,
    refresh,
  }
}
