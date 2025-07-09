import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | Afterfrag",
  description: "Login to Afterfrag, the ultimate gaming community platform.",
  openGraph: {
    title: "Login | Afterfrag",
    description: "Login to Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
    type: "website",
    url: "https://afterfrag.com/login",
  },
  twitter: {
    card: "summary",
    title: "Login | Afterfrag",
    description: "Login to Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
  },
}

export default function Head() {
  // This file only exports metadata
  return null
} 