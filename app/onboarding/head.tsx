import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Onboarding | Afterfrag",
  description: "Personalize your Afterfrag experience by selecting topics and interests.",
  openGraph: {
    title: "Onboarding | Afterfrag",
    description: "Personalize your Afterfrag experience by selecting topics and interests.",
    images: ["/placeholder-logo.png"],
    type: "website",
    url: "https://afterfrag.com/onboarding",
  },
  twitter: {
    card: "summary",
    title: "Onboarding | Afterfrag",
    description: "Personalize your Afterfrag experience by selecting topics and interests.",
    images: ["/placeholder-logo.png"],
  },
}

export default function Head() {
  // This file only exports metadata
  return null
} 