"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArticleCard } from "@/components/article-card";
import { StaffPick } from "@/components/staff-pick";
import { TopicBadge } from "@/components/topic-badge";
import { Navbar } from "@/components/navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Article {
  id: string;
  title: string;
  content: string; // Markdown content
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
  category?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  profile_image?: string;
  avatar?: string;
  profile_picture?: string;
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

        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. Author data might be unavailable. Please log in.");
        }

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Fetch categories
        const categoryResponse = await fetch("https://hypo-backend-3.onrender.com/def/category/", {
          cache: "no-store",
          headers,
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
          cache: "no-store",
          headers,
        });
        if (!articleResponse.ok) {
          throw new Error(`Error fetching articles: ${articleResponse.status}`);
        }
        const articleData = await articleResponse.json();

        console.log("Raw article data:", JSON.stringify(articleData, null, 2));

        // Fetch users
        let users: User[] = [];
        if (token) {
          try {
            const usersResponse = await fetch("https://hypo-backend-3.onrender.com/auth/users/", {
              method: "GET",
              headers,
            });

            if (!usersResponse.ok) {
              throw new Error(`Error fetching users: ${usersResponse.status} - ${usersResponse.statusText}`);
            }

            users = await usersResponse.json();
            console.log("Fetched users:", JSON.stringify(users, null, 2));
          } catch (userError) {
            console.error("Failed to fetch users:", userError);
            users = [];
          }
        } else {
          console.warn("No token available to fetch users.");
        }

        // Transform articles
        const transformedArticles = (Array.isArray(articleData) ? articleData : []).map((article: any) => {
          const authorObj = article.author || article.user || article.created_by || article.owner || {};

          const possibleNameFields = [
            authorObj.name,
            authorObj.first_name,
            authorObj.last_name,
            authorObj.firstName,
            authorObj.lastName,
            authorObj.full_name,
            authorObj.fullName,
            authorObj.username,
            authorObj.email?.split("@")[0],
            article.author_name,
            article.user_name,
            article.created_by_name,
            article.owner_name,
          ];

          let authorName = "Unknown Author";
          if (authorObj.first_name && authorObj.last_name) {
            authorName = `${authorObj.first_name} ${authorObj.last_name}`.trim();
          } else if (authorObj.firstName && authorObj.lastName) {
            authorName = `${authorObj.firstName} ${authorObj.lastName}`.trim();
          } else {
            authorName = possibleNameFields.find((field) => field !== undefined && field !== null) || "Unknown Author";
          }

          const normalizedAuthorName = authorName.toLowerCase().replace(/\s+/g, " ").trim();
          const authorUsername = authorObj.username || authorObj.email?.split("@")[0] || "";

          let avatarUrl = null;
          if (users.length > 0) {
            const matchedUser = users.find((user: User) => {
              const userName = (
                user.name ||
                (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
                user.username ||
                user.email?.split("@")[0] ||
                ""
              ).toLowerCase().replace(/\s+/g, " ").trim();
              return userName === normalizedAuthorName;
            });

            if (matchedUser) {
              const profileImage = matchedUser.profile_image || matchedUser.avatar || matchedUser.profile_picture || null;
              if (profileImage) {
                avatarUrl = profileImage.startsWith("http")
                  ? profileImage
                  : `https://res.cloudinary.com/dxf2c3jnr/${profileImage}`;
              }
            }
          }

          let imageUrl = null;
          if (article.image) {
            imageUrl = `https://res.cloudinary.com/dxf2c3jnr/${article.image}`;
          }

          const readTime =
            article.readTime ||
            (article.content
              ? `${Math.max(1, Math.ceil(article.content.length / 200))} min read`
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
            category: article.category || "",
          };
        });

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

  const filteredArticles =
    activeTab === "for-you"
      ? articles
      : articles.filter((article) => {
          const category = categories.find((cat) => cat.slug === activeTab);
          if (!category) return false;
          return article.category === category.id;
        });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-gray-900">State</span>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-700 text-sm">Dashboard</span>
          </div>
        </div>
      </header>

      {/* Category Filter */}
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
            {/* Start writing button for mobile */}
            <div className="mt-6">
              <a href="https://state-chi.vercel.app/write" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Start writing
                </Button>
              </a>
            </div>
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
                {/* Start writing button for desktop */}
                <a href="https://state-chi.vercel.app/write" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Start writing
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSampleArticles(): Article[] {
  return [
    {
      id: "1",
      title: "The Future of AI: Opportunities and Challenges",
      content: "Artificial intelligence is rapidly transforming industries across the globe. **This is bold**, *this is italic*, and ~~this is strikethrough~~.",
      author: { name: "Alex Johnson", username: "alexj", avatar: "/placeholder.svg?height=40&width=40" },
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
      content: "The global healthcare system is facing unprecedented challenges. Here's a list:\n- Issue 1\n- Issue 2\n- Issue 3",
      author: { name: "Sarah Lee", username: "sarahl", avatar: "/placeholder.svg?height=40&width=40" },
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