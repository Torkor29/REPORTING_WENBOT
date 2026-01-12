import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MainLayout } from "@/components/layout"
import { Role } from "@prisma/client"

export const metadata = {
  title: "Administration",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only ADMIN can access
  if (session.user.role !== Role.ADMIN) {
    redirect("/dashboard")
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
