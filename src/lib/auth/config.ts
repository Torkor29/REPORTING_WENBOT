import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db"
import { Role, AccountStatus } from "@prisma/client"

// Check if email is allowed (domain or allowlist)
async function isEmailAllowed(email: string): Promise<{ allowed: boolean; role: Role }> {
  const domain = email.split("@")[1]?.toLowerCase()

  // Check allowed domains
  const allowedDomain = await prisma.allowedDomain.findFirst({
    where: {
      domain: domain,
      isActive: true,
    },
  })

  if (allowedDomain) {
    return { allowed: true, role: allowedDomain.role }
  }

  // Check allowlist
  const allowedEmail = await prisma.allowedEmail.findFirst({
    where: {
      email: email.toLowerCase(),
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (allowedEmail) {
    return { allowed: true, role: allowedEmail.role }
  }

  return { allowed: false, role: Role.VIEWER }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Check if email is allowed
        const { allowed } = await isEmailAllowed(email)
        if (!allowed) {
          throw new Error("ACCESS_DENIED")
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.password) {
          throw new Error("INVALID_CREDENTIALS")
        }

        if (user.status !== AccountStatus.ACTIVE) {
          throw new Error("ACCOUNT_SUSPENDED")
        }

        const isValid = await compare(password, user.password)
        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      // Check if email is allowed
      const { allowed, role } = await isEmailAllowed(user.email)
      if (!allowed) {
        return false
      }

      // For OAuth, create or update user
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name,
              image: user.image,
              role: role,
              status: AccountStatus.ACTIVE,
              emailVerified: new Date(),
            },
          })
        } else if (existingUser.status !== AccountStatus.ACTIVE) {
          return false
        }
      }

      // Log login
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        })
        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              action: "USER_LOGIN",
              actorId: dbUser.id,
              metadata: { provider: account?.provider || "credentials" },
            },
          })
        }
      } catch (e) {
        console.error("Failed to log login:", e)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email!.toLowerCase() },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.status = dbUser.status
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}
