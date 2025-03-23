// Make the page component a client component to avoid hydration mismatches
"use client"

import { ArticleDashboard } from "@/components/article-dashboard"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <ArticleDashboard />
    </div>
  )
}

