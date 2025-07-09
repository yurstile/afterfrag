export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"]
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return imageExtensions.includes(ext)
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".wmv", ".flv", ".mkv"]
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return videoExtensions.includes(ext)
}

export function getMediaType(filename: string): "image" | "video" | "unknown" {
  if (isImageFile(filename)) return "image"
  if (isVideoFile(filename)) return "video"
  return "unknown"
}
