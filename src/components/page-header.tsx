import { Headphones, MessageSquareHeart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b bg-background/50 backdrop-blur-md px-4 py-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-border/60 bg-background/50 px-3 text-xs font-medium backdrop-blur-md transition-all hover:border-primary/40 hover:bg-muted/50"
          asChild
        >
          <Link href="mailto:support@resona.ai">
            <MessageSquareHeart className="size-3.5 text-primary" />
            <span className="hidden lg:block">Feedback</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-border/60 bg-background/50 px-3 text-xs font-medium backdrop-blur-md transition-all hover:border-primary/40 hover:bg-muted/50"
          asChild
        >
          <Link href="mailto:support@resona.ai">
            <Headphones className="size-3.5 text-sky-400" />
            <span className="hidden lg:block">Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
