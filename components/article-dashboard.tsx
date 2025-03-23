"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArticleCard } from "@/components/article-card";
import { StaffPick } from "@/components/staff-pick";
import { TopicBadge } from "@/components/topic-badge";
import { Navbar } from "@/components/navbar";

interface Article {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    username?: string;
  };
  publishedAt: string;
  readTime?: string;
  image?: string;
  views?: number;
  comments?: number;
  likes?: number;
  created_at?: string;
  category?: string; // Added: Category ID from the backend
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export function ArticleDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("for-you");

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function fetchData() {
      try {
        setLoading(true);

        // Fetch categories first
        const categoryResponse = await fetch("https://hypo-backend-3.onrender.com/def/category/", {
          cache: "no-store", // Prevent caching issues
        });
        if (!categoryResponse.ok) {
          throw new Error(`Error fetching categories: ${categoryResponse.status}`);
        }
        const categoryData = await categoryResponse.json();

        const transformedCategories = Array.isArray(categoryData)
          ? categoryData.map((cat: any) => ({
              id: cat.id || Math.random().toString(36).substring(2),
              name: cat.name || cat.title || "Unnamed Category",
              slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
            }))
          : [];
        setCategories(transformedCategories);

        // Fetch articles
        const articleResponse = await fetch("https://hypo-backend-3.onrender.com/def/article/", {
          cache: "no-store", // Prevent caching issues
        });
        if (!articleResponse.ok) {
          throw new Error(`Error fetching articles: ${articleResponse.status}`);
        }
        const articleData = await articleResponse.json();

        const transformedArticles = Array.isArray(articleData)
          ? articleData.map((article: any) => {
              let authorName = "Unknown Author";
              let authorUsername = "";
              let authorAvatar = null;

              if (article.author) {
                authorName = article.author.name || article.author.username || "Unknown Author";
                authorUsername = article.author.username || "";
                authorAvatar = article.author.profile_image;
              } else if (article.user) {
                authorName = article.user.name || article.user.username || "Unknown Author";
                authorUsername = article.user.username || "";
                authorAvatar = article.user.profile_image;
              }

              let imageUrl = null;
              if (article.image) {
                imageUrl = `https://res.cloudinary.com/dxf2c3jnr/${article.image}`;
              }

              let avatarUrl = authorAvatar
                ? `https://res.cloudinary.com/dxf2c3jnr/${authorAvatar}`
                : null;

              const readTime =
                article.readTime ||
                (article.content
                  ? `${Math.max(1, Math.ceil(article.content.length / 1000))} min read`
                  : "3 min read");

              return {
                id: article.id || Math.random().toString(36).substring(2),
                title: article.title || "Untitled Article",
                content: article.content || "",
                author: { name: authorName, username: authorUsername, avatar: avatarUrl },
                publishedAt: article.publishedAt || article.created_at || new Date().toISOString(),
                readTime,
                image: imageUrl,
                views: article.views || 0,
                comments: article.comments || 0,
                likes: article.likes || 0,
                created_at: article.created_at || new Date().toISOString(),
                category: article.category || "", // Ensure category field is captured
              };
            })
          : [];

        // Log the transformed articles to debug category field
        console.log("Transformed articles:", transformedArticles);

        setArticles(transformedArticles);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
        setArticles(getSampleArticles());
        setCategories(getSampleCategories());
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter articles based on the active tab (category)
  const filteredArticles =
    activeTab === "for-you"
      ? articles // Show all articles for "For you"
      : articles.filter((article) => {
          const category = categories.find((cat) => cat.slug === activeTab);
          if (!category) return false;
          return article.category === category.id; // Match by category ID
        });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Header (Matches ArticleWritePage) */}
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-gray-900">State</span>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-700 text-sm">Dashboard</span>
          </div>
        </div>
      </header>

      {/* Toolbar-like Area for Category Filter */}
      <div className="bg-gray-50 border-b border-gray-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto">
          <Button
            variant={activeTab === "for-you" ? "default" : "ghost"}
            size="sm"
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setActiveTab("for-you")}
          >
            For you
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.slug ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                activeTab === category.slug
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-700 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(category.slug || category.name.toLowerCase())}
            >
              {category.name}
            </Button>
          ))}
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-3">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                    <div className="flex justify-between">
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border rounded-md bg-red-50 text-red-600">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-10">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))
                ) : (
                  <p className="text-gray-600">No articles found for this category.</p>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-24">
              <h2 className="font-bold text-xl text-gray-900 mb-4">Staff Picks</h2>
              <div className="space-y-6">
                {!loading &&
                  articles.slice(0, 3).map((article) => (
                    <StaffPick key={`staff-${article.id}`} article={article} />
                  ))}
              </div>

              <Separator className="my-6 bg-gray-200" />

              <h3 className="font-bold text-gray-900 mb-4">Recommended topics</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.slice(0, 6).map((category) => (
                  <TopicBadge key={category.id}>{category.name}</TopicBadge>
                ))}
              </div>

              <div className="text-sm text-gray-500">
                <p className="mb-4">Writing on State</p>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="hover:text-gray-900">
                      New writer FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900">
                      Expert writing advice
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-gray-900">
                      Grow your readership
                    </a>
                  </li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Start writing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback sample data
function getSampleArticles(): Article[] {
  return [
    {
      id: "1",
      title: "The Future of AI: Opportunities and Challenges",
      content: "Artificial intelligence is rapidly transforming industries across the globe...",
      author: { name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40" },
      publishedAt: "2025-03-15T10:30:00Z",
      readTime: "8 min read",
      image: "/placeholder.svg?height=200&width=300",
      views: 1250,
      comments: 48,
      likes: 230,
      created_at: "2025-03-15T10:30:00Z",
      category: "1",
    },
    {
      id: "2",
      title: "Healthcare in Crisis: A Global Perspective",
      content: "The global healthcare system is facing unprecedented challenges...",
      author: { name: "Sarah Lee", avatar: "/placeholder.svg?height=40&width=40" },
      publishedAt: "2025-03-16T09:00:00Z",
      readTime: "5 min read",
      image: "/placeholder.svg?height=200&width=300",
      views: 890,
      comments: 32,
      likes: 150,
      created_at: "2025-03-16T09:00:00Z",
      category: "3",
    },
  ];
}

function getSampleCategories(): Category[] {
  return [
    { id: "1", name: "Technology", slug: "technology" },
    { id: "2", name: "Politics", slug: "politics" },
    { id: "3", name: "Health", slug: "health" },
  ];
}