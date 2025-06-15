"use client"

import { useState } from "react"
import { Check, Copy, Gift, MessageSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface DiscountCodeProps {
  code: string
  percentage: number
  expiresAt: string
}

export function DiscountCode({ code, percentage, expiresAt }: DiscountCodeProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Discount code copied to clipboard!")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  // Format expiration date
  const formattedExpiryDate = (() => {
    try {
      const date = new Date(expiresAt)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "30 days from now"
    }
  })()

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-center flex items-center justify-center gap-2">
          <Gift className="w-6 h-6 text-yellow-400" />
          Thank you for your feedback!
        </CardTitle>
        <p className="text-sm text-gray-400 text-center">
          Your responses have been saved and will help us improve our service
        </p>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {/* Success Message */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Feedback stored successfully</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Discount generated automatically</span>
          </div>
        </div>

        {/* Discount Code Display */}
        <div className="text-center space-y-4">
          <p className="text-gray-300">Here's your personalized discount code:</p>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-muted px-4 py-2 rounded-md font-mono text-lg font-bold tracking-wider">{code}</div>
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-10 w-10">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                {percentage}% OFF your next order
              </Badge>
              <p className="text-sm text-gray-400">Valid until {formattedExpiryDate}</p>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-left">
            <h4 className="text-sm font-medium text-gray-300 mb-2">How to use your discount:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Copy the discount code above</li>
              <li>• Place a new order on our website</li>
              <li>• Enter the code at checkout</li>
              <li>• Enjoy your {percentage}% discount!</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
