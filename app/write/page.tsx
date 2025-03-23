"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function ArticleWritePage() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Fetch token and categories on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setError("You must be logged in to write an article.");
      router.push("/");
    } else {
      setToken(storedToken);
      fetchCategories(storedToken);
    }
  }, [router]);

  // Fetch categories from the backend
  const fetchCategories = async (token: string) => {
    setCategoryLoading(true);
    try {
      const response = await fetch("https://hypo-backend-5.onrender.com/def/category/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data); // Assuming the response is an array of { id, name }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
      setCategories([
        { id: "1", name: "Technology" },
        { id: "2", name: "Lifestyle" },
        { id: "3", name: "Education" },
        { id: "4", name: "Health" },
      ]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError("");

    const articleData = new FormData();
    articleData.append("title", formData.title);
    articleData.append("content", formData.content);
    if (formData.category) articleData.append("category", formData.category);
    if (formData.image) articleData.append("image", formData.image);

    try {
      const response = await fetch("https://hypo-backend-5.onrender.com/def/article/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: articleData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.detail || "Failed to create article");
      }

      alert("Article created successfully!");
      setFormData({ title: "", content: "", category: "", image: null });
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header (Matches Navbar) */}
      <header className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-gray-900">State</span>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-700 text-sm">New Article</span>
          </div>
          <Button
            type="submit"
            form="article-form"
            disabled={isLoading || !token}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </header>

      {/* Toolbar-like Area */}
      <div className="bg-gray-50 border-b border-gray-200 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center space-x-4">
          <div className="flex-1">
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Untitled article"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isLoading || !token}
              className="text-2xl font-normal text-gray-900 border-none bg-transparent focus:ring-0 placeholder-gray-400 font-['Inter','Arial',sans-serif]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="category" className="text-sm text-gray-600">
              Category:
            </Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formData.category}
              disabled={isLoading || !token || categoryLoading || categories.length === 0}
            >
              <SelectTrigger className="w-40 border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded">
                <SelectValue placeholder={categoryLoading ? "Loading..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Document Area */}
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-lg p-8 min-h-[600px]">
          <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Content */}
            <div>
              <Textarea
                id="content"
                name="content"
                placeholder="Start writing here..."
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                required
                disabled={isLoading || !token}
                className="w-full border-none focus:ring-0 text-base text-gray-900 font-['Inter','Arial',sans-serif] leading-relaxed resize-none bg-transparent placeholder-gray-400"
              />
            </div>

            {/* Image Upload with Preview */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm text-gray-600">
                Featured Image
              </Label>
              <div className="relative">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  disabled={isLoading || !token}
                  className="border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rounded file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {imagePreview && (
                <div className="mt-4 relative max-w-md">
                  <img
                    src={imagePreview}
                    alt="Image preview"
                    className="w-full h-40 object-cover rounded border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full"
                    onClick={handleRemoveImage}
                    disabled={isLoading || !token}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}