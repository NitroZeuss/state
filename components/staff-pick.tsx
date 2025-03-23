import { formatDistanceToNow } from "date-fns"

interface Article {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
    username?: string
  }
  publishedAt: string
  readTime?: string
  image?: string
  views?: number
  comments?: number
  likes?: number
  created_at?: string
}

interface StaffPickProps {
  article: Article
}

export function StaffPick({ article }: StaffPickProps) {
  const formattedDate = formatPublishedDate(article.created_at || article.publishedAt)

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full overflow-hidden bg-muted">
          {article.author.avatar ? (
            <img
              src={article.author.avatar || "/placeholder.svg"}
              alt={article.author.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If avatar fails to load, replace with initial
                e.currentTarget.onerror = null // Prevent infinite loop
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs">
                    ${article.author.name.charAt(0)}
                  </div>
                `
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs">
              {article.author.name.charAt(0)}
            </div>
          )}
        </div>
        <span className="text-sm">{article.author.name}</span>
      </div>

      <h3 className="font-bold line-clamp-2">{article.title}</h3>
      <p className="text-sm text-muted-foreground">{formattedDate}</p>
    </div>
  )
}

function formatPublishedDate(dateString: string): string {
  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Recently"
    }

    return formatDistanceToNow(date, { addSuffix: true })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Recently"
  }
}

