import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  // Fetch user profile data from API
  const res = await fetch(`https://api.loryx.lol/users/${params.userId}/profile`, { next: { revalidate: 60 } })
  if (!res.ok) {
    return {
      title: `Profile | Afterfrag`,
      openGraph: { title: `Profile | Afterfrag` },
      twitter: { title: `Profile | Afterfrag` },
    }
  }
  const profile = await res.json()
  const username = profile.username || params.userId
  const displayName = profile.display_name || username
  const bio = profile.bio || `View @${username}'s profile on Afterfrag.`
  const image = profile.profile_picture_url || "/placeholder-user.jpg"

  return {
    title: `@${username} | Afterfrag`,
    description: bio,
    openGraph: {
      title: `@${username} | Afterfrag`,
      description: bio,
      images: [image],
      type: "profile",
      url: `https://afterfrag.com/profile/${username}`,
    },
    twitter: {
      card: "summary",
      title: `@${username} | Afterfrag`,
      description: bio,
      images: [image],
    },
  }
}

export default function Head() {
  // This file only exports metadata
  return null
} 