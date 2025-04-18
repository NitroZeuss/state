use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronRight, Plus, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For Search
import { Separator } from "@/components/ui/separator";
import { ArticleCard } from "@/components/redesigned-article-card"; // Assuming a redesigned card
import { StaffPick } from "@/components/redesigned-staff-pick"; // Assuming a redesigned staff pick
import { TopicBadge } from "@/components/ui/badge"; // Using Shadcn Badge for consistency
import { Navbar } from "@/components/navbar"; // Assuming Navbar is consistent

// --- Interfaces (Keep as is) ---
interface Article { /* ... */ }
interface Category { /* ... */ }
interface User { /* ... */ }

// --- Constants for Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Stagger animation for children
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const sidebarVariants = {
 hidden: { x: 50, opacity: 0 },
 visible: { x: 0, opacity: 1, transition: { delay: 0.3, duration: 0.4, ease: "easeOut" } },
};

// --- Fallback Data (Keep as is or refine) ---
function getSampleArticles(): Article[] { /* ... */ }
function getSampleCategories(): Category[] { /* ... */ }


export function ArticleDashboardRedesigned() {
  // --- State Management (Consider improvements) ---
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState("for-you");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching (Keep logic, but improve user feedback) ---
  useEffect(() => {
    // Fetching logic remains similar, but handle token/user association carefully.
    // Consider consolidating API calls if possible (backend sends author data with article).
    // ... (Your existing fetch logic here) ...

    // Ensure robust error handling and clear user messaging.
    // Use more specific loading states if fetching takes multiple steps.

  }, []); // Dependencies might change based on implementation

  // --- Filtering & Searching Logic ---
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        // Category Filter
        if (activeCategorySlug === "for-you") return true;
        const category = categories.find((cat) => cat.slug === activeCategorySlug);
        return category ? article.category === category.id : false; // Handle potential missing category safely
      })
      .filter((article) => {
        // Search Filter (Title, Content Snippet, Author Name)
        if (!searchTerm) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          article.title.toLowerCase().includes(lowerSearchTerm) ||
          article.content?.substring(0, 100).toLowerCase().includes(lowerSearchTerm) || // Search snippet
          article.author.name.toLowerCase().includes(lowerSearchTerm)
        );
      });
  }, [articles, categories, activeCategorySlug, searchTerm]);

  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 font-sans">
      {/* Navbar - Keep consistent or refine globally */}
      <Navbar />

      {/* --- Header / Toolbar --- */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
           {/* Title (Optional Refinement) */}
           <div className="flex items-center space-x-2">
             <span className="text-2xl font-semibold font-serif text-gray-900 dark:text-white">State</span>
             <span className="text-gray-400 dark:text-gray-600 text-sm">/</span>
             <span className="text-gray-700 dark:text-gray-300 text-sm">Dashboard</span>
           </div>

           {/* Search Input - Integrated Smoothly */}
           <div className="relative w-full sm:w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"/>
              <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-0 transition duration-200 ease-in-out"
              />
           </div>
        </div>

         {/* --- Category Filter Bar (Improved Styling & Interaction) --- */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-200/30 dark:border-gray-700/30 overflow-x-auto flex items-center gap-2">
           {/* "For You" Button */}
            <Button
                variant={activeCategorySlug === "for-you" ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-full px-4 transition-all duration-200 ${
                  activeCategorySlug === 'for-you'
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                 }`}
                onClick={() => setActiveCategorySlug("for-you")}
            >
                 For you
             </Button>

           {/* Dynamic Category Buttons */}
            {categories.map((category) => (
                 <Button
                     key={category.id}
                     variant={activeCategorySlug === category.slug ? "secondary" : "ghost"}
                     size="sm"
                     className={`rounded-full px-4 transition-all duration-200 ${
                       activeCategorySlug === category.slug
                         ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                         : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                     }`}
                     onClick={() => setActiveCategorySlug(category.slug || category.name.toLowerCase())}
                 >
                    {category.name}
                 </Button>
            ))}
            {/* Optional: Add subtle gradient mask at the end if overflow occurs */}
        </div>
      </motion.div>


      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* --- Article Feed --- */}
          <motion.div
            className="lg:col-span-8 space-y-8" // Adjust grid span as needed
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="wait"> {/* Use 'wait' or 'popLayout' depending on desired effect */}
               {loading ? (
                 // --- Enhanced Loading State (Skeleton/Shimmer) ---
                 <motion.div key="loading" variants={itemVariants} exit={{ opacity: 0 }}>
                   {[1, 2, 3].map((i) => (
                     <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 space-y-3 mb-6 animate-pulse">
                       <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                         <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                       </div>
                       <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                       <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                       <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                     </div>
                   ))}
                 </motion.div>
               ) : error ? (
                 // --- Clearer Error Message ---
                 <motion.div
                   key="error"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 flex flex-col items-center text-center"
                 >
                   <p className="font-medium mb-2">Oops! Something went wrong.</p>
                   <p className="text-sm mb-4">{error}</p>
                   <Button
                     variant="outline"
                     className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                     onClick={() => window.location.reload()} // Or better error recovery
                   >
                     Try Again
                   </Button>
                 </motion.div>
               ) : (
                 // --- Animated Article List ---
                 <motion.div key={activeCategorySlug} variants={containerVariants} initial="hidden" animate="visible">
                     {filteredArticles.length > 0 ? (
                         filteredArticles.map((article, index) => (
                             <motion.div key={article.id} variants={itemVariants}>
                                {/* USE THE REDESIGNED ArticleCard */}
                                 <ArticleCard article={article} />
                                 {index < filteredArticles.length - 1 && <Separator className="my-8 bg-gray-200 dark:bg-gray-700/50"/> /* Nicer separator */}
                             </motion.div>
                         ))
                      ) : (
                         <motion.p
                           key="no-articles"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="text-center text-gray-500 dark:text-gray-400 py-10"
                         >
                           No articles found {searchTerm ? "matching your search" : `in this category`}.
                         </motion.p>
                      )}
                 </motion.div>
              )}
            </AnimatePresence>
           </motion.div>


           {/* --- Sidebar (Animated & Sticky) --- */}
           <motion.aside
              className="lg:col-span-4 hidden lg:block" // Keep hidden on smaller screens initially
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="sticky top-28 space-y-8"> {/* Adjust top offset based on sticky header height */}

                  {/* Staff Picks Section */}
                 <div>
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Staff Picks</h2>
                    <div className="space-y-5">
                        {!loading && articles.slice(0, 3).map((article) => (
                            <StaffPick key={`staff-${article.id}`} article={article} />
                        ))}
                        {/* Add subtle skeleton loaders for staff picks too */}
                     </div>
                  </div>

                  {/* Separator */}
                  <Separator className="my-6 bg-gray-200 dark:bg-gray-700/50" />

                  {/* Recommended Topics Section */}
                   <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recommended Topics</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                          {categories.slice(0, 8).map((category) => (
                               // Use Shadcn Badge or custom styled one
                               <TopicBadge key={category.id} variant="secondary" className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setActiveCategorySlug(category.slug || category.name.toLowerCase())}>
                                  {category.name}
                                </TopicBadge>
                          ))}
                      </div>
                   </div>

                 {/* Writing Prompt / Info Section */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Write on State</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Share your voice and connect with readers.</p>
                      <a href="https://state-chi.vercel.app/write" target="_blank" rel="noopener noreferrer">
                          <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-white/50 dark:bg-black/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-black/30"
                          >
                               Start writing
                          </Button>
                      </a>
                       {/* Optional: Add links like FAQ etc. here */}
                   </div>
               </div>
             </motion.aside>
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
      content: "The global healthcare system is facing unprecedented challenges...",
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