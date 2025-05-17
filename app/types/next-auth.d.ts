import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string | null
      role?: string
      emailVerified?: boolean
    } & DefaultSession["Client"]
  }

  interface User extends DefaultUser {
    username?: string
    role?: string
    emailVerified?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    username?: string
    role?: string
    emailVerified?: boolean
  }
}
