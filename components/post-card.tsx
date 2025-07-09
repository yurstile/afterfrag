"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MessageCircle, Share, Eye, MoreHorizontal, Edit, Trash2, Flag } from "lucide-react"
import { formatDate } from "@/utils/date-utils"
import { MediaGallery } from "@/components/media-gallery"
import { LikeButton } from "@/components/like-button"

interface PostCardProps {
  id: number
  title: string
  content: string
  author_username: string
  author_display_name: string
  author_profile_picture_url: string | null
  community_name?: string
  like_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  post_tags: string[]
  media: Array<{
    id: number
    media_type: string
    media_url: string
    thumbnail_url?: string
  }>
  user_id: number
  showCommunityName?: boolean
  onLike?: (value: 1 | -1) => void
  onDelete?: () => void
  onEdit?: () => void
}

export function PostCard({
  id,
  title,
  content,
  author_username,
  author_display_name,
  author_profile_picture_url,
  community_name,
  like_count,
  comment_count,
  view_count,
  created_at,
  updated_at,
  post_tags,
  media,
  user_id,
  showCommunityName = false,
  onLike,
  onDelete,
  onEdit,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = content.length > 300

  const displayContent = shouldTruncate && !isExpanded ? content.slice(0, 300) + "..." : content

  // Map backend media to frontend format
  const mappedMedia = (media || []).map((item, idx) => ({
    id: idx,
    media_type: item.file_type || item.media_type,
    media_url: item.url || item.media_url,
    thumbnail_url: item.thumbnail_url,
  }))

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-500/30">
              <AvatarImage src={author_profile_picture_url || undefined} alt={author_display_name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                {author_display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${user_id}`}
                  className="font-medium text-white hover:text-blue-300 transition-colors"
                >
                  {author_display_name}
                </Link>
                <span className="text-slate-400 text-sm">@{author_username}</span>
                {showCommunityName && community_name && (
                  <>
                    <span className="text-slate-500">in</span>
                    <Link
                      href={`/f/${community_name}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      f/{community_name}
                    </Link>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-400">{formatDate(created_at)}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit} className="text-slate-300 hover:text-white hover:bg-slate-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Link href={`/posts/${id}`}>
            <h3 className="text-lg font-semibold mb-2 text-white hover:text-blue-300 transition-colors cursor-pointer">
              {title}
            </h3>
          </Link>

          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {displayContent}
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-blue-400 hover:text-blue-300 ml-2"
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </div>
        </div>

        {mappedMedia && mappedMedia.length > 0 && <MediaGallery media={mappedMedia} />}

        {post_tags && post_tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post_tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-900/30 text-blue-300 border-blue-500/30 hover:bg-blue-800/40 transition-colors"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center gap-4">
            <LikeButton postId={id} initialLikeCount={like_count} onLike={onLike} />

            <Link href={`/posts/${id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comment_count}</span>
              </Button>
            </Link>

            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <Eye className="h-4 w-4" />
              <span>{view_count}</span>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-blue-300 hover:bg-blue-900/20">
            <Share className="h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
