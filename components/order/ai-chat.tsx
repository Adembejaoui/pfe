"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Send, Bot, ChevronDown, ChevronUp, RefreshCw, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AIMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  orderId: number
  currentUser: {
    id: number | string
    username: string
    role?: string
  }
}

export function AIAssistant({ orderId, currentUser }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Only show AI assistant to clients
  const isClient = currentUser.role === "CLIENT"

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your AI assistant. I can help answer questions about your order or the boosting service. How can I help you today?",
          timestamp: new Date(),
        },
      ])
    }
  }, [messages.length])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message to chat
    const userMessage: AIMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          message: input,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to get AI response" }))
        throw new Error(errorData.message || "Failed to get AI response")
      }

      const data = await response.json()

      // Add AI response to chat
      const aiMessage: AIMessage = {
        role: "assistant",
        content: data.content || "Sorry, I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      console.error("Error getting AI response:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again or contact support if the issue persists.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // If not a client, don't show the AI assistant
  if (!isClient) return null

  return (
    <Card className="mb-4 border border-[#2A2F3F] bg-[#161A26] shadow-lg">
      <CardHeader className="px-4 py-3 border-b border-[#2A2F3F] bg-[#1A1E2C] flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
          AI Assistant
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {!isCollapsed && (
        <>
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      {message.role === "assistant" ? (
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600">
                          {currentUser.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="space-y-1">
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          message.role === "user" ? "bg-blue-600 text-white" : "bg-[#232838] border border-[#2A2F3F]"
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className={`text-xs text-gray-400 ${message.role === "user" ? "text-right" : "text-left"}`}>
                        {format(message.timestamp, "h:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="rounded-lg px-3 py-2 bg-[#232838] border border-[#2A2F3F]">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                          <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse delay-300"></div>
                          <span className="text-xs ml-1">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && !isLoading && (
                <div className="p-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md">
                  Error: {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardContent className="p-4 border-t border-[#2A2F3F]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI assistant a question..."
                className="flex-1 resize-none min-h-[40px] max-h-[120px] bg-[#1E2230] border-[#2A2F3F] focus:border-purple-500 focus:ring-purple-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  )
}
