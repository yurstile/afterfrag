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
    const diffMs = now.getTime() - utcDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`

    // For longer periods, show the actual date in local time
    return utcDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", utcDateString)
    return "Unknown"
  }
}

/**
 * Format a date string to local date
 */
export function formatDate(dateString: string): string {
  try {
    let date: Date

    if (dateString.includes("T")) {
      // ISO format with T separator
      date = new Date(dateString + (dateString.endsWith("Z") ? "" : "Z"))
    } else {
      // SQLite format without T separator
      const isoString = dateString.replace(" ", "T") + (dateString.endsWith("Z") ? "" : "Z")
      date = new Date(isoString)
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date format:", dateString)
      return "Unknown date"
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString)
    return "Unknown date"
  }
}
