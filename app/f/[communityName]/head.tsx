import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { communityName: string } }): Promise<Metadata> {
  // Fetch community data from API
  const res = await fetch(`https://api.loryx.lol/communities/f/${params.communityName}`, { next: { revalidate: 60 } })
  if (!res.ok) {
    return {
      title: `Fragsub | Afterfrag`,
      openGraph: { title: `Fragsub | Afterfrag` },
      twitter: { title: `Fragsub | Afterfrag` },
    }
  }
  const community = await res.json()
  const name = community.name || params.communityName
  const description = community.description || `View f/${name} on Afterfrag.`
  const image = community.group_picture_url || "/placeholder-logo.png"
  const url = `https://afterfrag.com/f/${name}`

  return {
    title: `f/${name} | Afterfrag`,
    description,
    openGraph: {
      title: `f/${name} | Afterfrag`,
      description,
      images: [image],
      type: "community",
      url,
    },
    twitter: {
      card: "summary",
      title: `f/${name} | Afterfrag`,
      description,
      images: [image],
    },
  }
}

export default function Head() {
  // This file only exports metadata
  return null
} 