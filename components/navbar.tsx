"use client";

import { useEffect, useState } from "react";
import { Bell, BookmarkIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LoginButton } from "./login-button";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  profile_image?: string;
}

export function Navbar() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("https://hypo-backend-3.onrender.com/def/user-info/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        console.log("User data:", data);

        const processedUser = {
          ...data,
          avatar: data.profile_image ? `https://res.cloudinary.com/dxf2c3jnr/${data.profile_image}` : null,
        };

        setUser(processedUser);
      } catch (error) {
        console.error("Error fetching user info:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload();
  };

  const handleWriteClick = () => {
    router.push("/write");
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-serif font-bold">State</h1>
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search" className="w-64 pl-8 rounded-full bg-muted border-none" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <BookmarkIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={handleWriteClick}
          >
            Write
          </Button>

          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name || user.username || "User profile"}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                            ${(user.name || user.username || "U").charAt(0)}
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                      {(user.name || user.username || "U").charAt(0)}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name || user.username}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>My Articles</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
