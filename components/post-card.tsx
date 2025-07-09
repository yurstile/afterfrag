"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MessageCircle, Eye, MoreHorizontal, Edit, Trash2, Share, ChevronUp, ChevronDown } from "lucide-react"
import { MediaGallery } from "@/components/media-gallery"
import { formatLastOnline } from "@/utils/date-utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { LikeButton } from "@/components/like-button"

interface PostMedia {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface PostTag {
  id: number
  community_id: number
  name: string
  color: string
}

interface PostCardProps {
  id: number
  community_id: number
  user_id: number
  title: string
  content: string
  post_tags: PostTag[]
  like_count: number
  view_count: number
  created_at: string
  updated_at: string
  media: PostMedia[]
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  comment_count?: number
  community_name?: string
  onLike?: (value: 1 | -1) => void
  onEdit?: () => void
  onDelete?: () => void
  isDetailView?: boolean
  showCommunityName?: boolean
}

export const PostCard: React.FC<PostCardProps> = ({
  id,
  community_id,
  user_id,
  title,
  content,
  post_tags,
  like_count,
  view_count,
  created_at,
  updated_at,
  media,
  author_username,
  author_display_name,
  author_profile_picture_url,
  comment_count = 0,
  community_name,
  onLike,
  onEdit,
  onDelete,
  isDetailView = false,
  showCommunityName = false,
}) => {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [isExpanded, setIsExpanded] = useState(isDetailView)

  const isOwnPost = user?.user_id === user_id
  const shouldTruncate = content.length > 300 && !isDetailView
  const displayContent = shouldTruncate && !isExpanded ? content.slice(0, 300) + "..." : content

  const handleViewPost = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return

      await fetch(`https://api.loryx.lol/posts/${id}/view`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error("Failed to record view:", err)
    }
  }

  const handleCardClick = () => {
    if (!isDetailView) {
      handleViewPost()
      router.push(`/posts/${id}`)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/posts/${id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content.slice(0, 100) + "...",
          url: url,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        // You could show a toast notification here
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
    }
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleCommunityClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDetailView) {
      handleViewPost()
      router.push(`/posts/${id}`)
    }
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${!isDetailView ? "cursor-pointer" : ""}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <Link href={`/profile/${user_id}`} onClick={handleProfileClick}>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={author_profile_picture_url || undefined} alt={author_display_name} />
                <AvatarFallback>{author_display_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${user_id}`} className="font-medium hover:underline" onClick={handleProfileClick}>
                  {author_display_name}
                </Link>
                <span className="text-sm text-gray-500">@{author_username}</span>
                {(showCommunityName || isDetailView) && community_name && (
                  <>
                    <span className="text-sm text-gray-500">in</span>
                    <Link
                      href={`/f/${community_name}`}
                      className="text-sm text-orange-600 hover:underline"
                      onClick={handleCommunityClick}
                    >
                      f/{community_name}
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatLastOnline(created_at)}</span>
                {updated_at !== created_at && <span>(edited)</span>}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {isOwnPost && onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {isOwnPost && onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Tags */}
        {post_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post_tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        {/* Content */}
        <div className="text-gray-700 mb-3 whitespace-pre-wrap">
          {displayContent}
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-orange-600 hover:text-orange-700 ml-2"
              onClick={handleExpandClick}
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Media */}
        {media.length > 0 && (
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <MediaGallery media={media} />
          </div>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {/* Like/Dislike */}
            <LikeButton itemId={id} itemType="post" initialLikeCount={like_count} />

            {/* Comments */}
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={handleCommentClick}>
              <MessageCircle className="h-4 w-4" />
              {comment_count}
            </Button>

            {/* Views */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              {view_count}
            </div>
          </div>

          {/* Share Button */}
          <Button variant="ghost" size="sm" className="gap-1 h-8 px-2" onClick={handleShare}>
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
