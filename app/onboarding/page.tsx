"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"

interface OnboardingStatus {
  completed: boolean
  selected_topics: string[]
  total_topics: number
}

const AVAILABLE_TOPICS = [
  "Science",
  "Technology",
  "Gaming",
  "Movies & TV Shows",
  "Music",
  "Sports",
  "Health & Fitness",
  "Food & Cooking",
  "Travel",
  "Fashion",
  "Art & Design",
  "Photography",
  "Books & Literature",
  "History",
  "Politics",
  "Finance & Investing",
  "Education",
  "Nature & Environment",
  "Space & Astronomy",
  "DIY & Crafts",
  "Comedy",
  "Memes & Humor",
  "Anime & Manga",
  "Cars & Motorcycles",
  "Relationships & Dating",
  "Mental Health",
  "Meditation & Mindfulness",
  "Business & Entrepreneurship",
  "Science Fiction & Fantasy",
  "True Crime",
  "Parenting",
  "Gardening",
  "Fitness Challenges",
  "Coding & Programming",
  "Pets & Animals",
  "Photography Tips",
  "Gaming Strategies",
  "Streaming & Podcasts",
  "Startups & Tech News",
  "Productivity Hacks",
  "Environment & Climate Change",
  "Art Tutorials",
  "Social Justice",
  "Home Improvement",
  "Career Advice",
  "Makeup & Beauty",
  "Language Learning",
  "Philosophy",
  "Festivals & Events",
  "Motivational Stories",
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)

  useEffect(() => {
    if (user) {
      checkOnboardingStatus()
    }
  }, [user])

  const checkOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("https://app.afterfrag.com/onboarding/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOnboardingStatus(data)
        if (data.completed) {
          // Already completed, redirect to dashboard
          router.push("/dashboard")
          return
        }
        setSelectedTopics(data.selected_topics || [])
      } else if (response.status === 401) {
        localStorage.removeItem("access_token")
        router.push("/login")
        return
      }
    } catch (err) {
      setError("Failed to check onboarding status")
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  const handleSubmit = async () => {
    if (selectedTopics.length < 3) {
      setError("Please select at least 3 topics to continue")
      return
    }

    setError("")
    setSubmitting(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("https://app.afterfrag.com/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topics: selectedTopics,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to complete onboarding")
      }

      // Success! Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete onboarding")
    } finally {
      setSubmitting(false)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-blue-200">Please log in to continue</p>
            <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-wygsedFsbzUPP0F7Z988Qqr7NPP93N.png"
                alt="Afterfrag Logo"
                className="h-6 w-6 filter brightness-0 invert opacity-80"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Afterfrag
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-blue-300">Welcome, @{user.username}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">Welcome to Afterfrag!</CardTitle>
            <CardDescription className="text-lg text-blue-200">
              Let's personalize your experience by selecting topics you're interested in.
              <br />
              Choose at least 3 topics to help us recommend the best Fragsubs for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-4">
                Selected: {selectedTopics.length} / {AVAILABLE_TOPICS.length} topics
                {selectedTopics.length >= 3 && <span className="text-green-400 ml-2">✓ Ready to continue</span>}
              </p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25"
                  style={{ width: `${Math.min((selectedTopics.length / 3) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AVAILABLE_TOPICS.map((topic) => (
                <Badge
                  key={topic}
                  variant={selectedTopics.includes(topic) ? "default" : "outline"}
                  className={`cursor-pointer p-3 text-center justify-center transition-all hover:scale-105 ${
                    selectedTopics.includes(topic)
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25"
                      : "hover:bg-blue-800/30 hover:border-blue-400 text-blue-300 border-blue-500/50"
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={selectedTopics.length < 3 || submitting}
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25 transition-all duration-200"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up your experience...
                  </>
                ) : (
                  `Continue to Afterfrag ${
                    selectedTopics.length >= 3
                      ? `(${selectedTopics.length} topics selected)`
                      : `(${3 - selectedTopics.length} more needed)`
                  }`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
