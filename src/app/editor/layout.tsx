import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MainLayout } from "@/components/layout"
import { Role } from "@prisma/client"

export const metadata = {
  title: "Editeur",
}

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Only ADMIN and EDITOR can access
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.EDITOR) {
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
