import type { Role, OrderStatus } from "@prisma/client"

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
