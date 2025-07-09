import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Afterfrag",
  description: "Read the privacy policy for Afterfrag, the ultimate gaming community platform.",
  openGraph: {
    title: "Privacy Policy | Afterfrag",
    description: "Read the privacy policy for Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
    type: "website",
    url: "https://afterfrag.com/privacy",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Afterfrag",
    description: "Read the privacy policy for Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
  },
}

export default function Head() {
  // This file only exports metadata
  return null
} 