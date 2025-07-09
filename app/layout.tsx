import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { OnlineStatusManager } from "@/components/online-status-manager"
import { NotificationProvider } from "@/components/notification-provider"

const inter = Inter({ subsets: ["latin"] })

// Update metadata
export const metadata: Metadata = {
  title: "Afterfrag - Gaming Community Platform",
  description: "Join the ultimate gaming community platform",
  icons: {
    icon: "https://afterfrag.com/logo.png",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <OnlineStatusManager />
          {children}
        </NotificationProvider>
      </body>
    </html>
  )
}
