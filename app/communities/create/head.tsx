import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Fragsub | Afterfrag",
  description: "Create a new Fragsub on Afterfrag, the ultimate gaming community platform.",
  openGraph: {
    title: "Create Fragsub | Afterfrag",
    description: "Create a new Fragsub on Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
    type: "website",
    url: "https://afterfrag.com/communities/create",
  },
  twitter: {
    card: "summary",
    title: "Create Fragsub | Afterfrag",
    description: "Create a new Fragsub on Afterfrag, the ultimate gaming community platform.",
    images: ["/placeholder-logo.png"],
  },
}

export default function Head() {
  // This file only exports metadata
  return null
} 