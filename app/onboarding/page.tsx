"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Loader2, CheckCircle } from "lucide-react"
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

      const response = await fetch("https://api.loryx.lol/onboarding/status", {
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

      const response = await fetch("https://api.loryx.lol/onboarding/complete", {
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
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
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
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
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-orange-600" />
              <span className="text-lg font-bold text-orange-600">Afterfrag</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, @{user.username}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to Afterfrag!</CardTitle>
            <CardDescription className="text-lg">
              Let's personalize your experience by selecting topics you're interested in.
              <br />
              Choose at least 3 topics to help us recommend the best Fragsubs for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Selected: {selectedTopics.length} / {AVAILABLE_TOPICS.length} topics
                {selectedTopics.length >= 3 && <span className="text-green-600 ml-2">✓ Ready to continue</span>}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
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
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "hover:bg-orange-50 hover:border-orange-300"
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleSubmit}
                disabled={selectedTopics.length < 3 || submitting}
                className="px-8 py-3 text-lg bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Setting up your experience...
                  </>
                ) : (
                  `Continue to Afterfrag ${selectedTopics.length >= 3 ? `(${selectedTopics.length} topics selected)` : `(${3 - selectedTopics.length} more needed)`}`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
