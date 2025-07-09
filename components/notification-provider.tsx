"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  duration?: number
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, "id">) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    setNotifications((prev) => [...prev, newNotification])

    // Auto remove after duration
    const duration = notification.duration || 5000
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const getVariant = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-900/20 text-green-300"
      case "error":
        return "border-red-500/50 bg-red-900/20 text-red-300"
      case "warning":
        return "border-yellow-500/50 bg-yellow-900/20 text-yellow-300"
      case "info":
        return "border-blue-500/50 bg-blue-900/20 text-blue-300"
      default:
        return "border-slate-500/50 bg-slate-900/20 text-slate-300"
    }
  }

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            variant={getVariant(notification.type)}
            className={`${getStyles(notification.type)} shadow-lg`}
          >
            <AlertDescription className="flex items-center justify-between">
              <span>{notification.message}</span>
              <button onClick={() => removeNotification(notification.id)} className="ml-2 hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
