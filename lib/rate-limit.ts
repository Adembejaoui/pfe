import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

type Options = {
  limit: number
  window: number // en secondes
  identifier: string
}

// Initialiser Redis (vous devrez ajouter les variables d'environnement UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function rateLimit(options: Options) {
  const { limit, window, identifier } = options
  const key = `rate-limit:${identifier}`

  // Obtenir le nombre actuel de requêtes
  const count = await redis.incr(key)

  // Si c'est la première requête, définir l'expiration
  if (count === 1) {
    await redis.expire(key, window)
  }

  // Vérifier si la limite est dépassée
  if (count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: await redis.ttl(key),
    }
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - count),
    reset: await redis.ttl(key),
  }
}

// Middleware pour limiter les requêtes
export async function rateLimitMiddleware(request: Request, options: Omit<Options, "identifier">) {
  // Obtenir l'adresse IP du client
  const ip = request.headers.get("x-forwarded-for") || "anonymous"

  // Obtenir le chemin de la requête
  const url = new URL(request.url)
  const path = url.pathname

  // Créer un identifiant unique basé sur l'IP et le chemin
  const identifier = `${ip}:${path}`

  // Vérifier le rate limit
  const result = await rateLimit({
    ...options,
    identifier,
  })

  // Si la limite est dépassée, renvoyer une erreur 429
  if (!result.success) {
    return NextResponse.json(
      { error: "Trop de requêtes, veuillez réessayer plus tard" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
          "Retry-After": result.reset.toString(),
        },
      },
    )
  }

  // Ajouter les en-têtes de rate limit à la réponse
  const headers = new Headers()
  headers.set("X-RateLimit-Limit", result.limit.toString())
  headers.set("X-RateLimit-Remaining", result.remaining.toString())
  headers.set("X-RateLimit-Reset", result.reset.toString())

  return null
}
