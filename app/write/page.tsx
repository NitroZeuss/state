"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Bold, Italic, Underline, Heading, Plus } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";

interface Category {
  id: string;
  name: string;
}

export default function ArticleWritePage() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit, UnderlineExtension],
    content: "<p>Start typing your masterpiece...</p>",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none text-gray-800 focus:outline-none min-h-[60vh] bg-transparent",
      },
      // Prevent Enter key from submitting the form
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          view.commands.splitBlock();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Optional: You can log or handle updates here, but don't trigger form submission
    },
  });

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

  const fetchCategories = async (token: string) => {
    setCategoryLoading(true);
    try {
      const response = await fetch("https://hypo-backend-5.onrender.com/def/category/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
        setImagePreview(URL.createObjectURL(file));
        setShowImageUpload(false);
      }
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ensure form submission is controlled
    if (!token || !editor) return;

    setIsLoading(true);
    setError("");

    const articleData = new FormData();
    articleData.append("title", formData.title);
    articleData.append("content", JSON.stringify(editor.getJSON()));
    if (formData.category) articleData.append("category", formData.category);
    if (formData.image) articleData.append("image", formData.image);

    try {
      const response = await fetch("https://hypo-backend-5.onrender.com/def/article/", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: articleData,
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.detail || "Failed to create article");

      alert("Article created successfully!");
      setFormData({ title: "", category: "", image: null });
      setImagePreview(null);
      editor.commands.setContent("<p>Start typing your masterpiece...</p>");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 py-3 px-6 fixed top-0 left-0 right-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-sans font-semibold text-gray-900">Notebook</span>
          </div>
          <Button
            type="submit"
            form="article-form"
            disabled={isLoading || !token}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-24 pb-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto relative min-h-[80vh]">
          {/* Notebook Lines Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-full w-full bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
          </div>

          <form id="article-form" onSubmit={handleSubmit} className="relative z-10 space-y-8">
            {/* Floating Toolbar */}
            <div className="fixed top-20 left-0 right-0 z-20">
              <div className="max-w-4xl mx-auto flex justify-between items-center bg-white border border-gray-200 rounded-md shadow-lg p-2">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button" // Prevent form submission
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={isLoading || !token}
                    className={`p-2 ${editor?.isActive("bold") ? "bg-gray-100" : ""}`}
                  >
                    <Bold className="h-4 w-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button" // Prevent form submission
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={isLoading || !token}
                    className={`p-2 ${editor?.isActive("italic") ? "bg-gray-100" : ""}`}
                  >
                    <Italic className="h-4 w-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button" // Prevent form submission
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    disabled={isLoading || !token}
                    className={`p-2 ${editor?.isActive("underline") ? "bg-gray-100" : ""}`}
                  >
                    <Underline className="h-4 w-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button" // Prevent form submission
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    disabled={isLoading || !token}
                    className={`p-2 ${editor?.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}`}
                  >
                    <Heading className="h-4 w-4 text-gray-700" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="category" className="text-sm text-gray-600 font-medium">
                    Category:
                  </Label>
                  <Select
                    onValueChange={handleCategoryChange}
                    value={formData.category}
                    disabled={isLoading || !token || categoryLoading || categories.length === 0}
                  >
                    <SelectTrigger className="w-48 border-gray-200 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500">
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

            {/* Title */}
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Title your story..."
              value={formData.title}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent Enter from submitting the form
                  editor?.commands.focus(); // Focus the editor instead
                }
              }}
              required
              disabled={isLoading || !token}
              className="text-3xl font-semibold text-gray-900 border-none bg-transparent focus:ring-0 placeholder-gray-300 font-sans tracking-tight mt-12"
            />

            {/* Content */}
            <div className="mt-6">
              <EditorContent editor={editor} />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              {!imagePreview && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button" // Prevent form submission
                  onClick={() => setShowImageUpload(true)}
                  disabled={isLoading || !token}
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Image</span>
                </Button>
              )}
              {showImageUpload && !imagePreview && (
                <div className="relative max-w-md">
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    disabled={isLoading || !token}
                    className="border-gray-200 rounded-md text-gray-700 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-3 file:py-1 hover:file:bg-blue-100"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button" // Prevent form submission
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowImageUpload(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {imagePreview && (
                <div className="relative max-w-md">
                  <img
                    src={imagePreview}
                    alt="Image preview"
                    className="w-full h-48 object-cover rounded-md border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    type="button" // Prevent form submission
                    className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600"
                    onClick={handleRemoveImage}
                    disabled={isLoading || !token}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}