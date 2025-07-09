export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("/cdn/")) {
    return `https://app.afterfrag.com${url}`
  }
  return url
}

export function isVideoFile(filename: string): boolean {
  const videoExtensions = [".mp4", ".mov", ".avi", ".webm"]
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return videoExtensions.includes(ext)
}

export function isImageFile(filename: string): boolean {
  const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif"]
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."))
  return imageExtensions.includes(ext)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
