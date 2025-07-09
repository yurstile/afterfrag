/**
 * Convert UTC timestamp to local time and format relative time
 * The backend stores timestamps in UTC and we need to properly handle the conversion
 */
export function formatLastOnline(utcDateString: string | null): string {
  if (!utcDateString) return "Never"

  try {
    // Parse the UTC timestamp - the backend sends ISO format strings
    let utcDate: Date

    if (utcDateString.includes("T")) {
      // ISO format with T separator (e.g., "2024-01-15T10:30:00.000000")
      utcDate = new Date(utcDateString + (utcDateString.endsWith("Z") ? "" : "Z"))
    } else {
      // SQLite format without T separator (e.g., "2024-01-15 10:30:00.000000")
      // Convert to ISO format and add Z to indicate UTC
      const isoString = utcDateString.replace(" ", "T") + (utcDateString.endsWith("Z") ? "" : "Z")
      utcDate = new Date(isoString)
    }

    // Check if the date is valid
    if (isNaN(utcDate.getTime())) {
      console.error("Invalid date format:", utcDateString)
      return "Unknown"
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    } else {
      return utcDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", utcDateString)
    return "Unknown"
  }
}

/**
 * Format a date string to local date
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Format a date string to local date and time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString()
}
