"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  OrganizationSwitcher,
  UserButton,
  useClerk
} from "@clerk/nextjs";
import {
  type LucideIcon,
  Home,
  LayoutGrid,
  AudioLines,
  Volume2,
  Settings,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { VoiceCreateDialog } from "@/features/voices/components/voice-create-dialog";
import { useState, useEffect } from "react";

interface MenuItem {
  title: string;
  url?: string;
  icon: LucideIcon;
  onClick?: () => void;
};

interface NavSectionProps {
  label?: string;
  items: MenuItem[];
  pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!!item.url}
                isActive={
                  item.url
                    ? item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)
                    : false
                }
                onClick={item.onClick}
                tooltip={item.title}
                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium rounded-lg border border-transparent transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:border-primary/20 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold cursor-pointer"
              >
                {item.url ? (
                  <Link href={item.url} className="flex items-center gap-3 w-full h-full">
                    <item.icon className="size-4 shrink-0 transition-transform duration-200" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 w-full h-full">
                    <item.icon className="size-4 shrink-0 transition-transform duration-200" />
                    <span className="truncate">{item.title}</span>
                  </div>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const clerk = useClerk();
  const [voiceDialogOpen, setVoiceDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Explore voices",
      url: "/voices",
      icon: LayoutGrid,
    },
    {
      title: "Text to speech",
      url: "/text-to-speech",
      icon: AudioLines,
    },
    {
      title: "Voice cloning",
      icon: Volume2,
      onClick: () => setVoiceDialogOpen(true),
    },
  ];

  const othersMenuItems: MenuItem[] = [
    {
      title: "Settings",
      icon: Settings,
      onClick: () => clerk.openOrganizationProfile(),
    },
    {
      title: "Help and support",
      url: "mailto:support@resona.ai",
      icon: Headphones,
    },
  ];

  return (
    <>
    <VoiceCreateDialog
      open={voiceDialogOpen}
      onOpenChange={setVoiceDialogOpen}
    />
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-col gap-4 pt-4">
        <div 
        className="flex items-center gap-2.5 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0 group-hover/sidebar:!justify-start group-hover/sidebar:!pl-1">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Image
              src="/logo.svg"
              alt="Resona"
              width={20}
              height={20}
              className="rounded-sm"
            />
          </div>
          <span className="group-data-[collapsible=icon]:hidden group-hover/sidebar:!inline font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Resona
          </span>
          <SidebarTrigger className="ml-auto lg:hidden" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            {mounted ? (
              <OrganizationSwitcher
                hidePersonal
                appearance={{
                  elements: {
                    rootBox: 
                      "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center! group-hover/sidebar:!w-full!",
                    organizationSwitcherTrigger:
                      "w-full! justify-between! bg-sidebar! hover:bg-sidebar-accent! border! border-sidebar-border! rounded-lg! pl-1.5! pr-2! py-1.5! gap-2.5! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1.5! group-hover/sidebar:!w-full! shadow-xs! transition-colors!",
                    organizationPreview: "gap-2!",
                    organizationPreviewAvatarBox: "size-6! rounded-md!",
                    organizationPreviewTextContainer: 
                      "text-xs! tracking-tight! font-medium! text-sidebar-foreground! group-data-[collapsible=icon]:hidden! group-hover/sidebar:!block!",
                    organizationPreviewMainIdentifier: "text-[13px]! font-medium!",
                    organizationSwitcherTriggerIcon:
                      "size-4! text-muted-foreground! group-data-[collapsible=icon]:hidden! group-hover/sidebar:!block!",
                  },
                }}
              />
            ) : (
              <Skeleton
                className="h-9 w-full group-data-[collapsible=icon]:size-8 rounded-lg border border-sidebar-border bg-sidebar-accent/50"
              />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <div className="border-b border-sidebar-border/60" />
      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        <NavSection
          label="Others"
          items={othersMenuItems}
          pathname={pathname}
        />
      </SidebarContent>
      <div className="border-b border-sidebar-border/60" />
      <SidebarFooter className="gap-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            {mounted ? (
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox:
                      "w-full! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center! group-hover/sidebar:!w-full!",
                    userButtonTrigger:
                      "w-full! justify-between! bg-sidebar! hover:bg-sidebar-accent! border! border-sidebar-border! rounded-lg! pl-1.5! pr-2! py-1.5! shadow-xs! group-data-[collapsible=icon]:w-auto! group-data-[collapsible=icon]:p-1.5! group-hover/sidebar:!w-full! group-data-[collapsible=icon]:after:hidden! group-hover/sidebar:after:!block! transition-colors!",
                    userButtonBox: "flex-row-reverse! gap-2.5!",
                    userButtonOuterIdentifier: "text-[13px]! tracking-tight! font-medium! text-sidebar-foreground! pl-0! group-data-[collapsible=icon]:hidden! group-hover/sidebar:!block!",
                    userButtonAvatarBox: "size-6!",
                  }
                }}
              />
            ) : (
              <Skeleton className="h-9 w-full group-data-[collapsible=icon]:size-8 rounded-lg border border-sidebar-border bg-sidebar-accent/50" />
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  );
}