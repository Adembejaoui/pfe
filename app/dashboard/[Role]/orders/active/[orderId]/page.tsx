import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { OrderInformation } from "@/components/order/order-information"
import { LoginInformation } from "@/components/order/login-information"
import { OrderProgress } from "@/components/order/order-progress"
import { MatchHistory } from "@/components/order/match-history"
import { UserStatus } from "@/components/order/user-status"
import type { Prisma } from "@prisma/client"
import { RealTimeChat } from "@/components/order/chat-wrapper"
import { AIAssistant } from "@/components/order/ai-chat"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, Shield } from "lucide-react"
import Link from "next/link"

interface OrderPageProps {
  params: {
    orderId: string
  }
}

// Define types for our order data with relations
type OrderWithRelations = Prisma.OrderGetPayload<{
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

async function getOrderData(orderId: number): Promise<{ order: OrderWithRelations | null; error?: string }> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        game: true,
        client: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        booster: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            sender: true,
          },
        },
        review: {
          include: {
            author: true,
          },
        },
      },
    })

    return { order }
  } catch (error) {
    console.error("Error fetching order:", error)
    return { order: null, error: "Failed to load order data" }
  }
}

// Function to check if booster is online (active in the last 5 minutes)
function isBoosterOnline(lastActive: Date | null): boolean {
  if (!lastActive) return false

  const fiveMinutesAgo = new Date()
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5)

  return lastActive > fiveMinutesAgo
}

export default async function OrderPage({ params }: OrderPageProps) {
  const orderIdNum = Number(params.orderId)
  if (isNaN(orderIdNum)) notFound()

  const { order, error } = await getOrderData(orderIdNum)
  if (!order) notFound()

  const session = await getServerSession(authOptions)

  // Format messages for the chat component
  const formattedMessages = order.messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    orderId: order.id,
    senderId: msg.sender.id,
    senderName: msg.sender.username || msg.sender.email,
    createdAt: msg.createdAt,
    isClient: msg.sender.role === "CLIENT",
    isAI: msg.isAI || false, // Include the isAI flag
  }))

  // Ensure currentUser has the correct ID format
  const currentUser = {
    id: session?.user?.id || 0,
    username: session?.user?.username || "Guest",
    role: session?.user?.role || "CLIENT",
  }

  // Check if booster is online
  const boosterOnline = order.booster ? isBoosterOnline(order.booster.lastActive) : false

  // Parse attributes from order
  const attributes = order.attributes
    ? typeof order.attributes === "string"
      ? JSON.parse(order.attributes as string)
      : order.attributes
    : {
        server: "euw",
        options: {
          ghostDuo: false,
          priority: false,
          voiceDuo: false,
          vipBooster: false,
          streamGames: false,
        },
        playerData: {
          lp: 89,
          tier: "emerald",
          wins: 65,
          losses: 40,
          server: "euw",
          tagLine: "EUW",
          division: "IV",
          username: "cham3oun",
          soloQueue: { lp: 40, tier: "emerald", division: "IV" },
        },
        currentRank: { lp: 40, tier: "emerald", division: "IV" },
        desiredRank: { tier: "master" },
        wins: 10,
        placements: 5,
      }

  // Get the service type
  const serviceType = order.gameTypeId || "rank-boost"

  // Extract order details based on service type
  const orderDetails = {
    id: order.id.toString(),
    server: attributes.server || "euw",
    platform: "PC",
    service: serviceType,
    options: attributes.options || {},
    currentRank: attributes.currentRank || {},
    // Only include desiredRank for rank-boost
    ...(serviceType === "rank-boost" && { desiredRank: attributes.desiredRank || {} }),
    // Include wins for win-boost
    ...(serviceType === "win-boost" && { wins: attributes.wins || 0 }),
    // Include placements for placement-boost
    ...(serviceType === "placement-boost" && { placements: attributes.placements || 0 }),
    cashout: `${order.price * 0.8} EUR`,
  }

  // Extract login details
  const loginDetails = {
    username: attributes.playerData?.username || "•••••••••",
    password: "•••••••••",
    server: attributes.playerData?.server,
    tagLine: attributes.playerData?.tagLine,
  }

  // Create the abandon action URL
  const abandonActionUrl = `/api/orders/${orderIdNum}/abandon`

  // Check if user is authorized to view this order
  const isClient = session?.user?.id == order.clientId || session?.user?.email === order.client?.email
  const isBooster =
    (order.boosterId !== null && session?.user?.id == order.boosterId) ||
    (order.booster && session?.user?.email === order.booster.email)
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"

  // For development purposes, allow all users to access the order
  // IMPORTANT: Remove this in production
  const allowAllForDebugging = process.env.NODE_ENV === "development"

  // If user is a booster but not assigned to this order, show access denied
  // Skip this check for admins and in development mode
  if (session?.user?.role === "BOOSTER" && !isBooster && !isAdmin && !allowAllForDebugging) {
    return (
      <div className="w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-red-700">You're not able to check this order</h1>
      </div>
    )
  }
  let dashboardRole
  if(session?.user.role =="CLIENT"){
     dashboardRole = `/dashboard/Client/orders/active`
  }else{
     dashboardRole = `/dashboard/Booster/orders/available`
  }
 
  return (
    <div className="w-full bg-[#0F1118] min-h-screen text-gray-100">
      {/* Header with back button and order ID */}
      <div className="sticky top-0 z-10 bg-[#161A26] border-b border-[#2A2F3F] shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={dashboardRole} className="flex items-center text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back to Dashboard</span>
            </Link>
            <Separator orientation="vertical" className="h-6 bg-[#2A2F3F]" />
            <div>
              <span className="text-gray-400 text-sm">Order ID:</span>
              <span className="ml-2 font-medium">{orderIdNum}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-[#1E2230] border-[#2A2F3F] text-purple-400 flex items-center">
              <Shield className="w-3.5 h-3.5 mr-1" />
              {serviceType === "rank-boost"
                ? "Rank Boost"
                : serviceType === "win-boost"
                  ? "Win Boost"
                  : "Placement Boost"}
            </Badge>
            <Badge variant="outline" className="bg-[#1E2230] border-[#2A2F3F] text-blue-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown date"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Order Information */}
          <div className="md:col-span-5 space-y-6">
            <OrderInformation orderId={orderIdNum.toString()} {...orderDetails} />
            {session?.user?.role !== "BOOSTER" && <LoginInformation {...loginDetails} />}
          </div>

          {/* Right Column - Chat */}
          <div className="md:col-span-7 space-y-6">
            <UserStatus username={order.booster?.username || "no booster for now"} isOnline={boosterOnline} />

            {/* AI Assistant - Added above the regular chat */}
            <AIAssistant
              orderId={order.id}
              currentUser={{
                id: currentUser.id,
                username: currentUser.username,
                role: currentUser.role,
              }}
            />

            <div className="bg-[#161A26] rounded-xl border border-[#2A2F3F] overflow-hidden shadow-lg">
              <header className="px-4 py-3 border-b border-[#2A2F3F] bg-[#1A1E2C]">
                <h2 className="text-lg font-semibold">Chat</h2>
                <div className="text-xs text-gray-400">
                  {boosterOnline
                    ? "Booster is online"
                    : order.booster
                      ? "Booster is offline"
                      : "No booster assigned yet"}
                </div>
              </header>
              <RealTimeChat
                orderId={order.id}
                initialMessages={formattedMessages}
                currentUser={{
                  id: currentUser.id,
                  username: currentUser.username,
                  role: currentUser.role,
                }}
                boosterOnline={boosterOnline}
              />
            </div>
          </div>

          {/* Bottom Section - Order Progress */}
          <div className="md:col-span-12">
            <OrderProgress
              currentRank={attributes.currentRank || {}}
              desiredRank={attributes.desiredRank || {}}
              orderId={orderIdNum}
              abandonActionUrl={abandonActionUrl}
              serviceType={serviceType}
              wins={attributes.wins}
              placements={attributes.placements}
              playerData={{
                username: attributes.playerData?.username,
                tagLine: attributes.playerData?.tagLine,
                server: attributes.server,
              }}
            />
          </div>

          {/* Bottom Section - Match History */}
          <div className="md:col-span-12">
            <MatchHistory
              playerData={{
                username: attributes.playerInfo?.username,
                tagLine: attributes.playerInfo?.tagLine,
                server: attributes.server,
              }}
              gameType={order.game?.name || "lol"} // Pass the game type from the order
            />
          </div>
        </div>
      </div>
    </div>
  )
}
