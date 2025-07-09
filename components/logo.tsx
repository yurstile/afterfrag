import React from "react"
import Image from "next/image"

export function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <span className="flex items-center gap-2 select-none">
      <Image
        src="/placeholder-logo.svg"
        alt="Afterfrag Logo"
        width={size}
        height={size}
        className="drop-shadow-lg"
        priority
      />
      {showText && (
        <span className="text-lg font-bold text-secondary text-glow-secondary tracking-wide" style={{ fontFamily: 'inherit' }}>
          Afterfrag
        </span>
      )}
    </span>
  )
}

export default Logo; 