"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, Shield, ExternalLink, ArrowLeft, MessageSquare, FileText, Calendar } from "lucide-react"
import { formatDate } from "@/utils/date-utils"

interface ModerationDetail {
  content_type: string
  content_id: number
  action: string
  reason: string
  admin_note: string
  created_at: string
}

interface BanInfo {
  not_approved: boolean
  reason: "banned" | "terminated"
  message: string
  banned_until: string | null
  moderation_details: ModerationDetail[]
}

export default function NotApprovedPage() {
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkBanStatus()
  }, [])

  const checkBanStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      const response = await fetch("https://app.afterfrag.com/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.not_approved) {
          setBanInfo(data)
        } else {
          // User is not banned, redirect to dashboard
          window.location.href = "/dashboard"
        }
      } else {
        // Invalid token, redirect to login
        localStorage.removeItem("access_token")
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Failed to check ban status:", err)
      window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }

  const getBanDuration = () => {
    if (!banInfo?.banned_until) return null

    const bannedUntil = new Date(banInfo.banned_until)
    const now = new Date()
    const diffMs = bannedUntil.getTime() - now.getTime()

    if (diffMs <= 0) return "Ban has expired"

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`
    return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "community":
        return <Shield className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes("ban")) return "bg-red-900/30 text-red-300 border-red-500/30"
    if (action === "terminate") return "bg-red-900/50 text-red-200 border-red-400/50"
    return "bg-orange-900/30 text-orange-300 border-orange-500/30"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Checking account status...</p>
        </div>
      </div>
    )
  }

  if (!banInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-blue-200">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isTerminated = banInfo.reason === "terminated"
  const banDuration = getBanDuration()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
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
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:border-blue-400 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Main Alert */}
          <Alert
            className={`${isTerminated ? "bg-red-900/20 border-red-500/50" : "bg-orange-900/20 border-orange-500/50"}`}
          >
            <AlertTriangle className={`h-4 w-4 ${isTerminated ? "text-red-400" : "text-orange-400"}`} />
            <AlertDescription className={`${isTerminated ? "text-red-300" : "text-orange-300"} text-lg font-medium`}>
              {banInfo.message}
            </AlertDescription>
          </Alert>

          {/* Account Status Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-blue-400" />
                Account Status
              </CardTitle>
              <CardDescription className="text-slate-300">Your account access has been restricted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Status</label>
                  <Badge className={getActionBadgeColor(banInfo.reason)}>
                    {isTerminated ? "Account Terminated" : "Temporarily Banned"}
                  </Badge>
                </div>

                {!isTerminated && banInfo.banned_until && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Duration</label>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span>{banDuration}</span>
                    </div>
                  </div>
                )}

                {!isTerminated && banInfo.banned_until && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Ban Expires</label>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(banInfo.banned_until)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Moderation History */}
          {banInfo.moderation_details && banInfo.moderation_details.length > 0 && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Moderation Actions</CardTitle>
                <CardDescription className="text-slate-300">
                  Actions taken on your content that led to this restriction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {banInfo.moderation_details.map((detail, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(detail.content_type)}
                          <span className="font-medium text-white capitalize">
                            {detail.content_type} #{detail.content_id}
                          </span>
                          <Badge className={getActionBadgeColor(detail.action)}>{detail.action}</Badge>
                        </div>
                        <span className="text-sm text-slate-400">{formatDate(detail.created_at)}</span>
                      </div>

                      {detail.reason && (
                        <div className="mb-2">
                          <label className="text-sm font-medium text-slate-400">Reason:</label>
                          <p className="text-slate-300 mt-1">{detail.reason}</p>
                        </div>
                      )}

                      {detail.admin_note && (
                        <div>
                          <label className="text-sm font-medium text-slate-400">Admin Note:</label>
                          <p className="text-slate-300 mt-1">{detail.admin_note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10">
            <CardHeader>
              <CardTitle className="text-white">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isTerminated ? (
                <div className="space-y-3">
                  <p className="text-slate-300">
                    Your account has been permanently terminated due to severe violations of our community guidelines.
                  </p>
                  <p className="text-slate-300">
                    If you believe this action was taken in error, you may contact our support team for review.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-300">
                    Your account will be automatically restored when the ban period expires.
                  </p>
                  <p className="text-slate-300">Please review our community guidelines to avoid future violations.</p>
                  {banDuration && !banDuration.includes("expired") && (
                    <p className="text-blue-300 font-medium">You can return to Afterfrag in {banDuration}.</p>
                  )}
                </div>
              )}

              <Separator className="bg-slate-700" />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-blue-500/50 text-blue-300 hover:bg-blue-800/50 hover:border-blue-400 bg-transparent"
                  asChild
                >
                  <a href="https://discord.gg/afterfrag" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
                  asChild
                >
                  <Link href="/terms">
                    <FileText className="h-4 w-4" />
                    Community Guidelines
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
