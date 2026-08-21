"use client";

import { useUser } from "@clerk/nextjs";
import { Headphones, MessageSquareHeart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const displayName = isLoaded
    ? (user?.fullName ?? user?.firstName ?? user?.username ?? "Creator")
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        {/* Status Pill / Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-xs backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
          </span>
          <Sparkles className="size-3.5 text-primary" />
          <span>{greeting}</span>
        </div>

        {/* Dynamic Gradient Username Title */}
        <div className="flex items-center gap-3">
          {isLoaded ? (
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              Hello,{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                {displayName}
              </span>{" "}
              <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
            </h1>
          ) : (
            <Skeleton className="h-10 w-64 rounded-xl" />
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Ready to synthesize speech or craft a new custom voice clone?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="hidden items-center gap-2.5 lg:flex">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/60 bg-background/50 px-3.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-muted/50 hover:shadow-xs"
          asChild
        >
          <Link href="mailto:support@resona.ai">
            <MessageSquareHeart className="size-3.5 text-primary" />
            <span>Feedback</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/60 bg-background/50 px-3.5 text-xs font-medium backdrop-blur-md transition-all duration-200 hover:border-primary/40 hover:bg-muted/50 hover:shadow-xs"
          asChild
        >
          <Link href="mailto:support@resona.ai">
            <Headphones className="size-3.5 text-sky-400" />
            <span>Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

