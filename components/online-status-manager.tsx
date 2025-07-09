"use client"

import { useEffect, useRef } from "react"
import { useCurrentUser } from "@/hooks/use-current-user"

export function OnlineStatusManager() {
  const { user } = useCurrentUser()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isOnlineRef = useRef(true)

  useEffect(() => {
    if (!user) return

    const updateOnlineStatus = async (isOnline: boolean) => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) return

        await fetch(`https://api.loryx.lol/users/${user.user_id}/profile/online-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_online: isOnline }),
        })
      } catch (error) {
        console.error("Failed to update online status:", error)
      }
    }

    const startHeartbeat = () => {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Set user as online immediately
      updateOnlineStatus(true)
      isOnlineRef.current = true

      // Send heartbeat every 30 seconds (half of the 60-second timeout)
      intervalRef.current = setInterval(() => {
        if (isOnlineRef.current) {
          updateOnlineStatus(true)
        }
      }, 30000)
    }

    const stopHeartbeat = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      isOnlineRef.current = false
      updateOnlineStatus(false)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, but don't immediately go offline
        // The backend will handle the timeout
        isOnlineRef.current = false
      } else {
        // Page is visible again, restart heartbeat
        startHeartbeat()
      }
    }

    const handleFocus = () => {
      startHeartbeat()
    }

    const handleBlur = () => {
      // Don't immediately stop heartbeat on blur
      // Let the backend timeout handle it
      isOnlineRef.current = false
    }

    const handleBeforeUnload = () => {
      // Send offline status when user is leaving
      const token = localStorage.getItem("access_token")
      if (token && navigator.sendBeacon) {
        const data = JSON.stringify({ is_online: false })
        const blob = new Blob([data], { type: "application/json" })
        navigator.sendBeacon(`https://api.loryx.lol/users/${user.user_id}/profile/online-status`, blob)
      }
    }

    const handleOnline = () => {
      startHeartbeat()
    }

    const handleOffline = () => {
      stopHeartbeat()
    }

    // Start the heartbeat
    startHeartbeat()

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Cleanup function
    return () => {
      stopHeartbeat()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [user])

  return null // This component doesn't render anything
}
