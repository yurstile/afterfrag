"use client"

import { useEffect } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"

export function OnlineStatusManager() {
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    if (loading) return // Wait for user to load
    if (!user?.user_id) {
      console.log("OnlineStatusManager: No user or user_id", { user, loading })
      return
    }

    const updateOnlineStatus = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          console.log("OnlineStatusManager: No access token")
          return
        }

        console.log("OnlineStatusManager: Updating online status for user", user.user_id)

        const response = await fetch(`https://app.afterfrag.com/users/${user.user_id}/profile/online-status`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_online: true
          }),
        })

        if (!response.ok) {
          console.error("Failed to update online status:", response.status, response.statusText)
        } else {
          console.log("OnlineStatusManager: Successfully updated online status")
        }
      } catch (error) {
        console.error("Failed to update online status:", error)
      }
    }

    // Update immediately
    updateOnlineStatus()

    // Update every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000)

    return () => clearInterval(interval)
  }, [user, loading])

  return null
}
