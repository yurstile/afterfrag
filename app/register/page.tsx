"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: any) => string
      reset: (widgetId?: string) => void
      getResponse: (widgetId?: string) => string
    }
  }
}

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
          theme: "dark",
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

      const response = await fetch("https://app.afterfrag.com/auth/me", {
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
      // Error checking session, continue to register
      localStorage.removeItem("access_token")
    } finally {
      setCheckingSession(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const turnstileToken = window.turnstile.getResponse(widgetId.current)
      if (!turnstileToken) {
        setError("Please complete the security check")
        setIsLoading(false)
        return
      }

      const response = await fetch("https://app.afterfrag.com/auth/register", {
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
        throw new Error(data.detail || "Registration failed")
      }

      // After successful registration, automatically log in the user
      try {
        const loginResponse = await fetch("https://app.afterfrag.com/auth/login", {
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

        const loginData = await loginResponse.json()

        if (loginResponse.ok) {
          // Store token and redirect to onboarding
          localStorage.setItem("access_token", loginData.access_token)
          window.location.href = "/onboarding"
        } else {
          // Login failed after registration, show success message and let user login manually
          setSuccess("Account created successfully! Please sign in with your credentials.")
          setUsername("")
          setPassword("")
          setConfirmPassword("")
        }
      } catch (loginErr) {
        // Login failed after registration, show success message
        setSuccess("Account created successfully! Please sign in with your credentials.")
        setUsername("")
        setPassword("")
        setConfirmPassword("")
      }

      // Reset Turnstile
      if (window.turnstile) {
        window.turnstile.reset(widgetId.current)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-blue-500/20 shadow-xl shadow-blue-500/10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-wygsedFsbzUPP0F7Z988Qqr7NPP93N.png"
              alt="Afterfrag Logo"
              className="h-8 w-8 filter brightness-0 invert opacity-80"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Afterfrag
            </h1>
          </div>
          <CardTitle className="text-xl text-white">Create your account</CardTitle>
          <CardDescription className="text-blue-200">Join the Afterfrag community today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-blue-200">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                minLength={3}
                className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-blue-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-blue-200">Security Check</Label>
              <div ref={turnstileRef} className="flex justify-center">
                {!turnstileLoaded && (
                  <div className="h-16 w-full bg-slate-700/50 rounded flex items-center justify-center border border-blue-500/20">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/20 border-green-500/50 text-green-300">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
              disabled={isLoading || !turnstileLoaded}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">Already have an account? </span>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
