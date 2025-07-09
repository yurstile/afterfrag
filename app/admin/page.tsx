"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, MessageSquare, FileText, Ban, UserX, Crown, History, ArrowLeft, Search, Plus, Group } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { formatDate } from "@/utils/date-utils"

interface User {
  id: number
  username: string
  is_admin: boolean
  banned_until: string | null
  is_terminated: boolean
}

interface ModerationAction {
  id: number
  user_id: number
  admin_id: number
  content_type: string
  content_id: number
  action: string
  reason: string
  admin_note: string
  created_at: string
  username: string
  admin_username: string
}

interface Community {
  id: number
  name: string
  description: string
  tags: string[]
  owner_username: string
  member_count: number
  created_at: string
}

export default function AdminPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const [users, setUsers] = useState<User[]>([])
  const [moderationHistory, setModerationHistory] = useState<ModerationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [moderationReason, setModerationReason] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [banDays, setBanDays] = useState("1")
  const [isAdmin, setIsAdmin] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [communitySearch, setCommunitySearch] = useState("")

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  useEffect(() => {
    if (isAdmin) {
      fetchUsers(searchQuery)
      fetchModerationHistory()
    }
  }, [isAdmin, searchQuery])

  useEffect(() => {
    if (isAdmin) fetchCommunities()
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) fetchCommunities(communitySearch)
  }, [communitySearch])

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user) return

      const response = await fetch(`https://app.afterfrag.com/users/${user.user_id}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const profile = await response.json()
        setIsAdmin(profile.is_admin || user.user_id === 1) // User ID 1 is always admin
      }
    } catch (err) {
      console.error("Failed to check admin status:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (search = "") => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/admin/search-users?query=${encodeURIComponent(search)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    }
  }

  const fetchModerationHistory = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      // This would need to be implemented in the backend
      const response = await fetch("https://app.afterfrag.com/admin/moderation-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setModerationHistory(data)
      }
    } catch (err) {
      console.error("Failed to fetch moderation history:", err)
    }
  }

  const fetchCommunities = async (search = "") => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return
      const response = await fetch(`https://app.afterfrag.com/admin/communities?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCommunities(data)
      }
    } catch (err) {
      console.error("Failed to fetch communities:", err)
    }
  }

  const handleBanUser = async (userId: number, days: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/admin/ban/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days,
          reason: moderationReason,
          admin_note: adminNote,
        }),
      })

      if (response.ok) {
        fetchUsers(searchQuery)
        fetchModerationHistory()
        setSelectedUser(null)
        setModerationReason("")
        setAdminNote("")
      }
    } catch (err) {
      console.error("Failed to ban user:", err)
    }
  }

  const handleTerminateUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/admin/terminate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: moderationReason,
          admin_note: adminNote,
        }),
      })

      if (response.ok) {
        fetchUsers(searchQuery)
        fetchModerationHistory()
        setSelectedUser(null)
        setModerationReason("")
        setAdminNote("")
      }
    } catch (err) {
      console.error("Failed to terminate user:", err)
    }
  }

  const handleGrantAdmin = async (userId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/admin/grant-admin/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: moderationReason,
          admin_note: adminNote,
        }),
      })

      if (response.ok) {
        fetchUsers(searchQuery)
        fetchModerationHistory()
        setSelectedUser(null)
        setModerationReason("")
        setAdminNote("")
      }
    } catch (err) {
      console.error("Failed to grant admin:", err)
    }
  }

  const handleRevokeAdmin = async (userId: number) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      const response = await fetch(`https://app.afterfrag.com/admin/revoke-admin/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: moderationReason,
          admin_note: adminNote,
        }),
      })

      if (response.ok) {
        fetchUsers(searchQuery)
        fetchModerationHistory()
        setSelectedUser(null)
        setModerationReason("")
        setAdminNote("")
      }
    } catch (err) {
      console.error("Failed to revoke admin:", err)
    }
  }

  // Users are already filtered by the backend search
  const filteredUsers = users

  const getStatusBadge = (user: User) => {
    if (user.is_terminated) {
      return <Badge className="bg-red-900/30 text-red-300 border-red-500/30">Terminated</Badge>
    }
    if (user.banned_until) {
      const bannedUntil = new Date(user.banned_until)
      if (bannedUntil > new Date()) {
        return <Badge className="bg-orange-900/30 text-orange-300 border-orange-500/30">Banned</Badge>
      }
    }
    if (user.is_admin) {
      return <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">Admin</Badge>
    }
    return <Badge className="bg-green-900/30 text-green-300 border-green-500/30">Active</Badge>
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-red-500/20">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2 text-white">Access Denied</h2>
            <p className="mb-4 text-red-200">You don't have permission to access the admin panel.</p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
            </div>
            <Badge className="bg-blue-900/30 text-blue-300 border-blue-500/30">Administrator</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="groups" className="data-[state=active]:bg-blue-600">
              <Group className="h-4 w-4 mr-2" />
              Group Management
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600">
              <History className="h-4 w-4 mr-2" />
              Moderation History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
                <CardDescription className="text-slate-300">Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-blue-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">@{user.username}</h3>
                            {getStatusBadge(user)}
                          </div>
                          <p className="text-sm text-slate-400">User ID: {user.id}</p>
                          {user.banned_until && new Date(user.banned_until) > new Date() && (
                            <p className="text-sm text-orange-400">Banned until {formatDate(user.banned_until)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                              Actions
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Moderate User: @{selectedUser?.username}
                              </DialogTitle>
                              <DialogDescription className="text-slate-300">
                                Take moderation action on this user account
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Reason</label>
                                <Input
                                  placeholder="Enter reason for action..."
                                  value={moderationReason}
                                  onChange={(e) => setModerationReason(e.target.value)}
                                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">
                                  Admin Note (Optional)
                                </label>
                                <Textarea
                                  placeholder="Internal note for other admins..."
                                  value={adminNote}
                                  onChange={(e) => setAdminNote(e.target.value)}
                                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                  rows={3}
                                />
                              </div>
                            </div>

                            <DialogFooter className="flex flex-wrap gap-2">
                              {!selectedUser?.is_terminated && !selectedUser?.banned_until && (
                                <>
                                  <Select value={banDays} onValueChange={setBanDays}>
                                    <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="1" className="text-slate-300">
                                        1 Day
                                      </SelectItem>
                                      <SelectItem value="3" className="text-slate-300">
                                        3 Days
                                      </SelectItem>
                                      <SelectItem value="7" className="text-slate-300">
                                        7 Days
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    onClick={() =>
                                      selectedUser && handleBanUser(selectedUser.id, Number.parseInt(banDays))
                                    }
                                    className="gap-2 bg-orange-600 hover:bg-orange-700"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Ban User
                                  </Button>
                                </>
                              )}

                              {!selectedUser?.is_terminated && (
                                <Button
                                  onClick={() => selectedUser && handleTerminateUser(selectedUser.id)}
                                  className="gap-2 bg-red-600 hover:bg-red-700"
                                >
                                  <UserX className="h-4 w-4" />
                                  Terminate
                                </Button>
                              )}

                              {selectedUser && !selectedUser.is_admin && selectedUser.id !== 1 && (
                                <Button
                                  onClick={() => handleGrantAdmin(selectedUser.id)}
                                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Crown className="h-4 w-4" />
                                  Grant Admin
                                </Button>
                              )}

                              {selectedUser &&
                                selectedUser.is_admin &&
                                selectedUser.id !== 1 &&
                                user?.user_id === 1 && (
                                  <Button
                                    onClick={() => handleRevokeAdmin(selectedUser.id)}
                                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Crown className="h-4 w-4" />
                                    Revoke Admin
                                  </Button>
                                )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-500/20">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Groups ({communities.length})</CardTitle>
                <CardDescription className="text-slate-300">Manage communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communities.map((community) => (
                    <div key={community.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div>
                        <h3 className="font-medium text-white">{community.name}</h3>
                        <p className="text-sm text-slate-400">{community.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(community.tags || []).map((tag) => (
                            <Badge key={tag} className="bg-blue-900/30 text-blue-300 border-blue-500/30 text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Owner: @{community.owner_username} • {community.member_count} members • Created {formatDate(community.created_at)}</p>
                      </div>
                      <div>
                        {/* Future: Add moderation actions for communities here */}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Moderation History</CardTitle>
                <CardDescription className="text-slate-300">
                  Recent moderation actions taken by administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationHistory.map((action) => (
                    <div key={action.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {action.content_type === "post" && <FileText className="h-4 w-4 text-blue-400" />}
                          {action.content_type === "comment" && <MessageSquare className="h-4 w-4 text-green-400" />}
                          {action.content_type === "user" && <Users className="h-4 w-4 text-purple-400" />}
                          <span className="font-medium text-white">
                            {action.action.replace("_", " ").toUpperCase()}
                          </span>
                          <Badge className="bg-slate-600 text-slate-300">{action.content_type}</Badge>
                        </div>
                        <span className="text-sm text-slate-400">{formatDate(action.created_at)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Target User:</span>
                          <span className="text-white ml-2">@{action.username}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Admin:</span>
                          <span className="text-blue-300 ml-2">@{action.admin_username}</span>
                        </div>
                      </div>

                      {action.reason && (
                        <div className="mt-2">
                          <span className="text-slate-400 text-sm">Reason:</span>
                          <p className="text-slate-300 mt-1">{action.reason}</p>
                        </div>
                      )}

                      {action.admin_note && (
                        <div className="mt-2">
                          <span className="text-slate-400 text-sm">Admin Note:</span>
                          <p className="text-slate-300 mt-1">{action.admin_note}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {moderationHistory.length === 0 && (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50 text-slate-500" />
                      <h3 className="text-lg font-medium mb-2 text-slate-300">No moderation history</h3>
                      <p className="text-slate-400">No moderation actions have been taken yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
