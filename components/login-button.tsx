"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    profile_image: null as File | null,
  });

  useEffect(() => {
    setError(""); // Reset error state on dialog open/close
  }, [open]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "login" | "register"
  ) => {
    if (type === "login") {
      setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    } else if (e.target.type === "file") {
      const file = e.target.files ? e.target.files[0] : null;
      console.log("File input changed:", {
        name: file?.name,
        size: file?.size,
        type: file?.type,
      });
      setRegisterData((prev) => ({
        ...prev,
        profile_image: file,
      }));
    } else {
      console.log(`Updating ${e.target.name}:`, e.target.value);
      setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    endpoint: string,
    data: object,
    successMessage?: string
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (endpoint === "jwt/create") {
        // Login uses JSON
        console.log("Login request payload:", data);
        response = await fetch(`https://hypo-backend-5.onrender.com/auth/${endpoint}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        // Registration uses FormData
        const formData = new FormData();
        formData.append("username", registerData.username);
        formData.append("email", registerData.email);
        formData.append("password", registerData.password);
        formData.append("first_name", registerData.first_name);
        formData.append("last_name", registerData.last_name);
        formData.append("bio", registerData.bio);
        if (registerData.profile_image) {
          formData.append("profile_image", registerData.profile_image);
        }

        // Log FormData contents (note: FormData doesn’t have a simple .toString())
        console.log("Registration FormData contents:");
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
        }

        response = await fetch("https://hypo-backend-5.onrender.com/def/register/", {
          method: "POST",
          body: formData,
        });
      }

      const responseData = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", responseData);

      if (!response.ok) {
        console.error("Backend error response:", responseData);
        throw new Error(
          responseData.detail || 
          JSON.stringify(responseData) || 
          "Registration failed"
        );
      }

      if (endpoint === "jwt/create") {
        console.log("Login successful, setting token:", responseData.access);
        localStorage.setItem("token", responseData.access);
        window.location.reload();
      } else {
        console.log("Registration successful:", responseData);
        alert(successMessage || "Success!");
        setOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Try again.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Sign In / Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={(e) => handleSubmit(e, "jwt/create", loginData)}>
              <DialogHeader>
                <DialogTitle>Login</DialogTitle>
                <DialogDescription>Enter your credentials to access your account.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    name="username"
                    type="text"
                    placeholder="your_username"
                    value={loginData.username}
                    onChange={(e) => handleInputChange(e, "login")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => handleInputChange(e, "login")}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="register">
            <form
              onSubmit={(e) =>
                handleSubmit(e, "register", registerData, "Registration successful! You can now log in.")
              }
            >
              <DialogHeader>
                <DialogTitle>Register</DialogTitle>
                <DialogDescription>Create an account to get started.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    name="username"
                    type="text"
                    placeholder="your_username"
                    value={registerData.username}
                    onChange={(e) => handleInputChange(e, "register")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="your_email@example.com"
                    value={registerData.email}
                    onChange={(e) => handleInputChange(e, "register")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => handleInputChange(e, "register")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-first-name">First Name</Label>
                  <Input
                    id="register-first-name"
                    name="first_name"
                    type="text"
                    placeholder="Your first name"
                    value={registerData.first_name}
                    onChange={(e) => handleInputChange(e, "register")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-last-name">Last Name</Label>
                  <Input
                    id="register-last-name"
                    name="last_name"
                    type="text"
                    placeholder="Your last name"
                    value={registerData.last_name}
                    onChange={(e) => handleInputChange(e, "register")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-bio">Bio</Label>
                  <Input
                    id="register-bio"
                    name="bio"
                    type="text"
                    placeholder="Tell us about yourself"
                    value={registerData.bio}
                    onChange={(e) => handleInputChange(e, "register")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="register-profile-image">Profile Image</Label>
                  <Input
                    id="register-profile-image"
                    name="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleInputChange(e, "register")}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default LoginButton;