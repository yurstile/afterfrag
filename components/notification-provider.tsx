"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { X } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (message: string, type: Notification["type"], duration?: number) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((message: string, type: Notification["type"], duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = { id, message, type, duration }

    setNotifications((prev) => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({
  notifications,
  onRemove,
}: {
  notifications: Notification[]
  onRemove: (id: string) => void
}) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border flex items-center justify-between
            ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
            ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
            ${notification.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : ""}
            ${notification.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
          `}
        >
          <span className="text-sm font-medium">{notification.message}</span>
          <button onClick={() => onRemove(notification.id)} className="ml-3 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return {
    success: (message: string) => context.addNotification(message, "success"),
    error: (message: string) => context.addNotification(message, "error"),
    warning: (message: string) => context.addNotification(message, "warning"),
    info: (message: string) => context.addNotification(message, "info"),
  }
}

// Export alias for compatibility
export const useNotification = useNotifications
