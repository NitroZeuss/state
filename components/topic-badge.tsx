import type { ReactNode } from "react"

interface TopicBadgeProps {
  children: ReactNode
}

export function TopicBadge({ children }: TopicBadgeProps) {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm hover:bg-muted/80 cursor-pointer">
      {children}
    </div>
  )
}

