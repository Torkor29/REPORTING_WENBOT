import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MainLayout } from "@/components/layout"
import type { Role } from "@prisma/client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <MainLayout
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role as Role,
      }}
    >
      {children}
    </MainLayout>
  )
}
