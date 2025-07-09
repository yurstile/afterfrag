"use client"

import { useState, useEffect } from "react"

interface CurrentUser {
  user_id: number
  username: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setError("No token found")
        setLoading(false)
        return
      }

      const response = await fetch("https://api.loryx.lol/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem("access_token")
          window.location.href = "/login"
          return
        }
        throw new Error("Failed to fetch user info")
      }

      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user")
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    setLoading(true)
    setError(null)
    fetchCurrentUser()
  }

  return { user, loading, error, refetch }
}
