import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Wifi, WifiOff } from "lucide-react"

interface UserStatusProps {
  username: string
  isOnline: boolean
}

export function UserStatus({ username, isOnline }: UserStatusProps) {
  // Get initials for avatar
  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-[#2A2F3F]">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                {initials || "??"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{username}</div>
              <div className="text-xs text-gray-400">Booster</div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center ${
              isOnline
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
