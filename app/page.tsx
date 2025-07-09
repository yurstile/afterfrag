"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useCurrentUser()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!user.is_approved) {
        router.push("/not-approved")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
