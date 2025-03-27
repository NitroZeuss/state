"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import { use } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  content: any; // Can be Tiptap JSON or HTML (old format)
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

interface ArticlePageProps {
  params: Promise<{ id: string }>;
}

// Utility function to check if content is HTML
function isHTML(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

// Utility function to check if content is valid JSON
function isValidJson(content: string): boolean {
  try {
    JSON.parse(content);
    return true;
  } catch (e) {
    return false;
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Tiptap editor in read-only mode
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editable: false,
    content: "",
  });

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. Author data might be unavailable. Please log in.");
        }

        const headers = {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        };

        const articleResponse = await fetch(`https://hypo-backend-3.onrender.com/def/article/${id}/`, {
          cache: "no-store",
          headers,
        });

        if (!articleResponse.ok) {
          throw new Error(`Error fetching article: ${articleResponse.status} - ${articleResponse.statusText}`);
        }

        const articleData = await articleResponse.json();
        console.log("Raw article data:", JSON.stringify(articleData, null, 2));

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
        }

        const authorObj = articleData.author || articleData.user || articleData.created_by || articleData.owner || {};

        let authorName = "Unknown Author";
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
          articleData.author_name,
          articleData.user_name,
          articleData.created_by_name,
          articleData.owner_name,
        ];

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
          const matchedUser = users.find((user: User) =>
            (user.name ||
              (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null) ||
              user.username ||
              user.email?.split("@")[0] || "")
              .toLowerCase()
              .replace(/\s+/g, " ")
              .trim() === normalizedAuthorName
          );

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
        if (articleData.image) {
          imageUrl = `https://res.cloudinary.com/dxf2c3jnr/${articleData.image}`;
        }

        let plainText = "";
        if (isHTML(articleData.content)) {
          const div = document.createElement("div");
          div.innerHTML = articleData.content;
          plainText = div.textContent || div.innerText || "";
        } else if (isValidJson(articleData.content)) {
          const contentJson = JSON.parse(articleData.content);
          plainText = contentJson.content?.map((node: any) => node.text || "").join(" ") || "";
        } else {
          plainText = articleData.content || "";
        }

        const readTime =
          articleData.readTime ||
          (plainText ? `${Math.max(1, Math.ceil(plainText.length / 200))} min read` : "3 min read");

        const transformedArticle: Article = {
          id: articleData.id || id,
          title: articleData.title || "Untitled Article",
          content: articleData.content || "",
          author: { name: authorName, username: authorUsername, avatar: avatarUrl },
          publishedAt: articleData.publishedAt || articleData.created_at || new Date().toISOString(),
          readTime,
          image: imageUrl,
          views: articleData.views || 0,
          comments: articleData.comments || 0,
          likes: articleData.likes || 0,
          created_at: articleData.created_at || new Date().toISOString(),
          category: articleData.category || "",
        };

        setArticle(transformedArticle);

        if (isValidJson(articleData.content)) {
          const contentJson = JSON.parse(articleData.content);
          editor?.commands.setContent(contentJson);
        } else if (isHTML(articleData.content)) {
          editor?.commands.setContent("");
        } else {
          editor?.commands.setContent(articleData.content || "");
        }
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Failed to load article. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [id, editor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container px-4 md:px-6 py-8 pt-20">
          <div className="space-y-6">
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="h-64 w-full bg-gray-200 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container px-4 md:px-6 py-8 pt-20">
          <div className="p-4 border rounded-md bg-red-50 text-red-600">
            <p>{error || "Article not found."}</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sanitizedContent = isHTML(article.content)
    ? DOMPurify.sanitize(article.content, {
        ALLOWED_TAGS: ["p", "b", "i", "u", "strong", "em", "br", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6"],
        ALLOWED_ATTR: [],
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container px-4 md:px-6 py-8 pt-20 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            {article.author.avatar ? (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg"
              style={{ display: article.author.avatar ? "none" : "flex" }}
            >
              {article.author.name.charAt(0)}
            </div>
            <div>
              <p className="text-gray-900 font-medium">
                {article.author.name}
                {article.author.username && (
                  <span className="text-gray-500"> (@{article.author.username})</span>
                )}
              </p>
              <p className="text-gray-500 text-sm">
                {new Date(article.publishedAt).toLocaleDateString()} · {article.readTime}
              </p>
            </div>
          </div>
        </header>

        {article.image && (
          <div className="mb-8">
            <Image
              src={article.image}
              alt={article.title}
              width={672}
              height={378}
              className="rounded-lg w-full h-auto"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-800">
          {isValidJson(article.content) ? (
            <EditorContent editor={editor} />
          ) : isHTML(article.content) ? (
            <div>{parse(sanitizedContent!)}</div>
          ) : (
            <p>{article.content}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-8 text-gray-500">
          <button className="flex items-center gap-1">
            <Heart className="h-5 w-5" />
            <span>{article.likes}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageSquare className="h-5 w-5" />
            <span>{article.comments}</span>
          </button>
          <button className="flex items-center gap-1">
            <Share2 className="h-5 w-5" />
          </button>
          <span className="ml-auto">{article.views} views</span>
        </div>
      </div>
    </div>
  );
}

// Navbar Component
function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 py-2 px-4 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl font-sans font-medium text-gray-900 hover:text-gray-700">
            State
          </Link>
          <span className="text-gray-500 text-sm">/</span>
          <span className="text-gray-700 text-sm">Article</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/write" className="text-gray-600 hover:text-gray-900 text-sm">
            Write
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}