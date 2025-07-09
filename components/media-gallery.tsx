"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react"
import { getMediaUrl } from "@/utils/media-utils"

interface MediaItem {
  id: number
  media_type: string
  media_url: string
  thumbnail_url?: string
}

interface MediaGalleryProps {
  media: MediaItem[]
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!media || media.length === 0) return null

  const openModal = (index: number) => {
    setSelectedIndex(index)
  }

  const closeModal = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  const renderMediaItem = (item: MediaItem, index: number, isModal = false) => {
    const mediaUrl = getMediaUrl(item.media_url)

    if (item.media_type === "video") {
      return (
        <div key={item.id} className="relative">
          <video
            src={mediaUrl}
            controls={isModal}
            className={`w-full h-full object-cover ${isModal ? "max-h-[80vh]" : "max-h-96"} rounded-lg`}
            poster={item.thumbnail_url ? getMediaUrl(item.thumbnail_url) : undefined}
          />
          {!isModal && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <Play className="h-12 w-12 text-white" />
            </div>
          )}
        </div>
      )
    }

    return (
      <img
        key={item.id}
        src={mediaUrl || "/placeholder.svg"}
        alt={`Media ${index + 1}`}
        className={`w-full h-full object-cover ${isModal ? "max-h-[80vh]" : "max-h-96"} rounded-lg cursor-pointer`}
        onClick={() => !isModal && openModal(index)}
      />
    )
  }

  const getGridClass = () => {
    switch (media.length) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-2"
      case 3:
        return "grid-cols-2 grid-rows-2"
      case 4:
        return "grid-cols-2 grid-rows-2"
      default:
        return "grid-cols-2 grid-rows-2"
    }
  }

  return (
    <>
      <div className={`grid gap-2 ${getGridClass()}`}>
        {media.slice(0, 4).map((item, index) => (
          <div
            key={item.id}
            className={`relative overflow-hidden rounded-lg ${media.length === 3 && index === 0 ? "row-span-2" : ""}`}
            onClick={() => openModal(index)}
          >
            {renderMediaItem(item, index)}
            {media.length > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg cursor-pointer">
                <span className="text-white text-xl font-semibold">+{media.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 p-0">
          {selectedIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="absolute top-2 right-2 z-10 text-white hover:bg-black/20"
              >
                <X className="h-4 w-4" />
              </Button>

              {media.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={selectedIndex === 0}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-black/20"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNext}
                    disabled={selectedIndex === media.length - 1}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-black/20"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center p-4">
                {renderMediaItem(media[selectedIndex], selectedIndex, true)}
              </div>

              {media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {selectedIndex + 1} / {media.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
