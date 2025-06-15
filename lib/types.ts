import type { Role, OrderStatus, Prisma } from "@prisma/client"

export interface User {
  id: number
  email: string
  username?: string
  role: Role
}

export interface Message {
  id: number
  content: string
  orderId: number
  senderId: number
  senderName: string
  createdAt: Date
  isClient: boolean
}

export interface Order {
  id: number
  gameId: number
  gameTypeId: string
  clientId: number
  boosterId?: number
  status: OrderStatus
  attributes: any
  price: number
  createdAt: Date
  updatedAt: Date
  client: User
  booster?: User
  messages: Message[]
}
export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    game: true
    client: {
      select: {
        id: true
        username: true
        email: true
        role: true
      }
    }
    booster: {
      select: {
        id: true
        username: true
        email: true
        role: true
        lastActive: true
      }
    }
    messages: {
      include: {
        sender: true
      }
    }
    review: {
      include: {
        author: true
      }
    }
  }
}>