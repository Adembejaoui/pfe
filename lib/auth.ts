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
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: 60 * 60 * 24 * 30,
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
          throw new Error("Email et mot de passe requis")
        }

        const existUser = await db.user.findUnique({ where: { email: credentials.email } })

        if (!existUser) {
          throw new Error("Utilisateur non trouvé")
        }

        const passwordMatch = await compare(credentials.password, existUser.password)
        if (!passwordMatch) {
          throw new Error("Mot de passe incorrect")
        }

        return {
          id: existUser.id.toString(),
          email: existUser.email,
          username: existUser.username,
          role: existUser.role,
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
        token.email = user.email
        token.role = user.role
      }

      // Handle role updates via session update
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.email = token.email
        session.user.role = token.role
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Ensure we have the latest role from the database
      if (user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: Number.parseInt(user.id.toString()) },
          select: { role: true },
        })

        if (dbUser && user.role !== dbUser.role) {
          // Update the user object with the latest role
          user.role = dbUser.role
        }
      }
    },
  },
}
