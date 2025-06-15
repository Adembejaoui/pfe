import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db"
import { compare } from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/authentification",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "exemple@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null
        }

        try {
          const existUser = await db.user.findUnique({ 
            where: { email: credentials.email } 
          })

          if (!existUser) {
            return null
          }

          const passwordMatch = await compare(credentials.password, existUser.password)
          if (!passwordMatch) {
            return null
          }

          // Return user object matching the extended User type
          return {
            id: existUser.id.toString(),
            email: existUser.email,
            username: existUser.username || undefined, // Convert null to undefined
            role: existUser.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email!
        token.role = user.role
      }

      // Handle role updates via session update
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.email = token.email!
        session.user.role = token.role
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Ensure we have the latest role from the database
      if (user.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: Number.parseInt(user.id.toString()) },
            select: { role: true },
          })

          if (dbUser && user.role !== dbUser.role) {
            user.role = dbUser.role
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      }
    },
  },
}