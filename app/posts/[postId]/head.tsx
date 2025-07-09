import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  // Fetch post data from API
  const res = await fetch(`https://api.loryx.lol/posts/${params.postId}`, { next: { revalidate: 60 } })
  if (!res.ok) {
    return {
      title: `Post | Afterfrag`,
      openGraph: { title: `Post | Afterfrag` },
      twitter: { title: `Post | Afterfrag` },
    }
  }
  const post = await res.json()
  const title = post.title || `Post | Afterfrag`
  const description = post.content?.slice(0, 160) || `View this post on Afterfrag.`
  const image = post.media?.[0]?.url || "/placeholder.jpg"
  const url = `https://afterfrag.com/posts/${params.postId}`

  return {
    title: `${title} | Afterfrag`,
    description,
    openGraph: {
      title: `${title} | Afterfrag`,
      description,
      images: [image],
      type: "article",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Afterfrag`,
      description,
      images: [image],
    },
  }
}

export default function Head() {
  // This file only exports metadata
  return null
} 