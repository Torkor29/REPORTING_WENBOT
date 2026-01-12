"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  BookOpen,
  Edit3,
  Settings,
  Users,
  Database,
  Zap,
  MessageSquare,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useState } from "react"
import type { Role } from "@prisma/client"

interface SidebarProps {
  userRole: Role
}

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    title: "Veille Hebdo",
    href: "/weekly-digest",
    icon: Newspaper,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    title: "Rapport Mensuel",
    href: "/monthly-report",
    icon: FileText,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    title: "Trade Journal",
    href: "/journal",
    icon: BookOpen,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    title: "Editeur",
    href: "/editor",
    icon: Edit3,
    roles: ["ADMIN", "EDITOR"],
  },
]

const adminNavItems = [
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    title: "Sources",
    href: "/admin/sources",
    icon: Database,
    roles: ["ADMIN"],
  },
  {
    title: "Jobs",
    href: "/admin/jobs",
    icon: Zap,
    roles: ["ADMIN"],
  },
  {
    title: "Prompts",
    href: "/admin/prompts",
    icon: MessageSquare,
    roles: ["ADMIN"],
  },
  {
    title: "Discord",
    href: "/admin/discord",
    icon: MessageSquare,
    roles: ["ADMIN"],
  },
  {
    title: "Parametres",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const filteredMainNav = mainNavItems.filter((item) =>
    item.roles.includes(userRole)
  )
  const filteredAdminNav = adminNavItems.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
              <Shield className="h-5 w-5 text-zinc-50 dark:text-zinc-900" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Investor Hub
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                )
              }

              return <div key={item.href}>{linkContent}</div>
            })}
          </nav>

          {filteredAdminNav.length > 0 && (
            <>
              <Separator className="my-4 mx-2" />
              {!isCollapsed && (
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Administration
                  </span>
                </div>
              )}
              <nav className="space-y-1 px-2">
                {filteredAdminNav.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  const Icon = item.icon

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                        isCollapsed && "justify-center px-2"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    )
                  }

                  return <div key={item.href}>{linkContent}</div>
                })}
              </nav>
            </>
          )}
        </ScrollArea>

        {/* Collapse button */}
        <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
