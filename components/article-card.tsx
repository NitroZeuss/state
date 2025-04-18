import { formatDistanceToNow } from "date-fns"
import { BookmarkIcon, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = formatPublishedDate(article.created_at || article.publishedAt)

  return (
    <div className="flex flex-col space-y-3">
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
        <span className="text-sm font-medium">{article.author.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <h2 className="text-xl font-bold mb-1 line-clamp-2">{article.title}</h2>
          <p className="text-muted-foreground line-clamp-2 mb-2">{article.content}</p>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>{formattedDate}</span>
              {article.readTime && <span>{article.readTime}</span>}
            </div>

            <div className="flex items-center space-x-4">
              {article.likes !== undefined && (
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{article.likes}</span>
                </div>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8">
                <BookmarkIcon className="h-4 w-4" />
                <span className="sr-only">Save article</span>
              </Button>

              {article.comments !== undefined && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{article.comments}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {article.image && (
          <div className="md:col-span-1 order-first md:order-last">
            <div className="aspect-square md:aspect-[4/3] overflow-hidden rounded-md">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails to load, replace with placeholder
                  e.currentTarget.src = `/placeholder.svg?height=200&width=150`
                }}
              />
            </div>
          </div>
        )}
      </div>
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

