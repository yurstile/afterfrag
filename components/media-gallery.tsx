"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Download, Play } from "lucide-react"

interface MediaItem {
  file_uuid: string
  file_type: "image" | "video"
  file_size: number
  url: string
}

interface MediaGalleryProps {
  media: MediaItem[]
  className?: string
}

export function MediaGallery({ media, className = "" }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openGallery = (index: number) => {
    setSelectedIndex(index)
  }

  const closeGallery = () => {
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

  const downloadMedia = (item: MediaItem) => {
    const link = document.createElement("a")
    link.href = item.url
    link.download = item.file_uuid
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Fix media URLs to use api.loryx.lol
  const fixedMedia = media.map((item) => ({
    ...item,
    url: item.url.replace("https://loryx.lol/", "https://api.loryx.lol/"),
  }))

  if (fixedMedia.length === 0) return null

  const getGridClass = () => {
    switch (fixedMedia.length) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-2"
      case 3:
        return "grid-cols-2 md:grid-cols-3"
      default:
        return "grid-cols-2 md:grid-cols-3"
    }
  }

  return (
    <>
      <div className={`grid gap-2 ${getGridClass()} ${className}`}>
        {fixedMedia.slice(0, 6).map((item, index) => (
          <div
            key={item.file_uuid}
            className="relative rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
            onClick={() => openGallery(index)}
          >
            {item.file_type === "image" ? (
              <img
                src={item.url || "/placeholder.svg"}
                alt="Media"
                className="w-full h-32 md:h-40 object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="relative w-full h-32 md:h-40">
                <video src={item.url} className="w-full h-full object-cover" muted />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}

            {/* Show count overlay for additional media */}
            {index === 5 && fixedMedia.length > 6 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">+{fixedMedia.length - 6}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full-screen gallery dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeGallery()}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedIndex !== null && (
            <div className="relative w-full h-full bg-black">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeGallery}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Download button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
                onClick={() => downloadMedia(fixedMedia[selectedIndex])}
              >
                <Download className="h-4 w-4" />
              </Button>

              {/* Navigation buttons */}
              {fixedMedia.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={goToPrevious}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
                    onClick={goToNext}
                    disabled={selectedIndex === fixedMedia.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Media content */}
              <div className="w-full h-full flex items-center justify-center">
                {fixedMedia[selectedIndex].file_type === "image" ? (
                  <img
                    src={fixedMedia[selectedIndex].url || "/placeholder.svg"}
                    alt="Media"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video src={fixedMedia[selectedIndex].url} controls className="max-w-full max-h-full" autoPlay />
                )}
              </div>

              {/* Media counter */}
              {fixedMedia.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedIndex + 1} / {fixedMedia.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MediaGallery
