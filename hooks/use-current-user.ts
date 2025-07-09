"use client"

import { useState, useEffect } from "react"

interface User {
  user_id: number
  username: string
  email: string
  display_name: string
  profile_picture_url: string | null
  is_approved: boolean
  role: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          console.log("useCurrentUser: No access token found")
          setLoading(false)
          return
        }

        console.log("useCurrentUser: Fetching user data...")

        const response = await fetch("https://app.afterfrag.com/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          console.log("useCurrentUser: Received user data", userData)
          setUser(userData)
        } else {
          console.error("useCurrentUser: Failed to fetch user", response.status, response.statusText)
          localStorage.removeItem("access_token")
        }
      } catch (error) {
        console.error("useCurrentUser: Error fetching user:", error)
        localStorage.removeItem("access_token")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
