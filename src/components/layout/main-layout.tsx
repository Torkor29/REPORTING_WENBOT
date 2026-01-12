"use client"

import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import type { Role } from "@prisma/client"

interface MainLayoutProps {
  children: React.ReactNode
  user: {
    name: string | null
    email: string
    image: string | null
    role: Role
  }
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar userRole={user.role} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar user={user} />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
