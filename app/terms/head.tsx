import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Afterfrag",
  description: "Read the terms of service for Afterfrag, the ultimate gaming community platform.",
  openGraph: {
    title: "Terms of Service | Afterfrag",
    description: "Read the terms of service for Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
    type: "website",
    url: "https://afterfrag.com/terms",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Afterfrag",
    description: "Read the terms of service for Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
  },
}

export default function Head() {
  // This file only exports metadata
  return null
} 