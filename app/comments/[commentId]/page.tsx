"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, ArrowLeft } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface CommentMedia {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  like_count: number
  created_at: string
  updated_at: string
  media: CommentMedia[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  parent_id?: number | null
  children?: Comment[]
}

interface Post {
  id: number
  title: string
  community_id: number
}

export default function CommentThreadPage() {
  const params = useParams()
  const commentId = params.commentId as string
  const { user, loading: userLoading } = useCurrentUser()
  const [comment, setComment] = useState<Comment | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [communityName, setCommunityName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      fetchComment()
    }
  }, [user, commentId])

  const fetchComment = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      // For now, we'll need to get the comment from the post's comment tree
      // This is a limitation of the current API structure
      // In a real implementation, you'd want a direct comment endpoint

      setError("Comment thread page not fully implemented yet. Please go back to the original post.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comment")
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading comment thread...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please log in to continue</p>
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
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
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
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
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-lg font-bold text-orange-600">Afterfrag</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Comment Thread</h1>
          <p className="text-gray-600 mb-4">This feature is coming soon!</p>
          <Button onClick={() => window.history.back()}>Go Back to Post</Button>
        </div>
      </main>
    </div>
  )
}
