"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageSquare } from "lucide-react"

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: any) => string
      reset: (widgetId?: string) => void
      getResponse: (widgetId?: string) => string
    }
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileLoaded, setTurnstileLoaded] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string>("")

  useEffect(() => {
    // Check if user is already logged in
    checkExistingSession()

    // Load Turnstile script
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    script.onload = () => {
      setTurnstileLoaded(true)
      if (turnstileRef.current) {
        widgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: "0x4AAAAAABkEQeO4OZX7Txke",
          theme: "light",
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        setCheckingSession(false)
        return
      }

      const response = await fetch("https://api.loryx.lol/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // User is already logged in, redirect to dashboard
        window.location.href = "/dashboard"
        return
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("access_token")
      }
    } catch (err) {
      // Error checking session, continue to login
      localStorage.removeItem("access_token")
    } finally {
      setCheckingSession(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const turnstileToken = window.turnstile.getResponse(widgetId.current)
      if (!turnstileToken) {
        setError("Please complete the security check")
        setIsLoading(false)
        return
      }

      const response = await fetch("https://api.loryx.lol/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          turnstile_token: turnstileToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Login failed")
      }

      // Store token and check onboarding status
      localStorage.setItem("access_token", data.access_token)

      // Check onboarding status
      const onboardingResponse = await fetch("https://api.loryx.lol/onboarding/status", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      })

      if (onboardingResponse.ok) {
        const onboardingData = await onboardingResponse.json()
        if (onboardingData.completed) {
          window.location.href = "/dashboard"
        } else {
          window.location.href = "/onboarding"
        }
      } else {
        // If can't check onboarding, go to onboarding to be safe
        window.location.href = "/onboarding"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      // Reset Turnstile
      if (window.turnstile) {
        window.turnstile.reset(widgetId.current)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-orange-600">Afterfrag</h1>
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Security Check</Label>
              <div ref={turnstileRef} className="flex justify-center">
                {!turnstileLoaded && (
                  <div className="h-16 w-full bg-gray-100 rounded flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={isLoading || !turnstileLoaded}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {"Don't have an account? "}
            <Link href="/register" className="text-orange-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
