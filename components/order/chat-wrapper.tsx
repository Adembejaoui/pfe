"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Send, Check, AlertCircle, RefreshCw, ArrowDownCircle, Wifi, WifiOff, Bot } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: number
  content: string
  orderId: number
  senderId: number
  senderName: string
  createdAt: Date | string
  isClient: boolean
  isAI?: boolean
  tempId?: string
  failed?: boolean
  isRetrying?: boolean
}

interface RealTimeChatProps {
  orderId: number
  initialMessages: Message[]
  currentUser: {
    id: number | string
    username: string
    role?: string
  }
  boosterOnline?: boolean
}

export function RealTimeChat({ orderId, initialMessages, currentUser, boosterOnline = false }: RealTimeChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true)
  const [isWaitingForAI, setIsWaitingForAI] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Convert currentUser.id to number if it's a string
  const currentUserId = typeof currentUser.id === "string" ? Number.parseInt(currentUser.id, 10) : currentUser.id

  // Set up SSE connection for real-time updates
  useEffect(() => {
    // Function to set up the EventSource
    const setupEventSource = () => {
      // Clear any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      // Create EventSource for SSE
      const eventSource = new EventSource(`/api/chat/${orderId}`, {
        withCredentials: true,
      })

      // Handle connection open
      eventSource.onopen = () => {
        setIsConnected(true)
        setConnectionError(null)
        setReconnectAttempts(0)
        console.log("SSE connection opened")
      }

      // Handle specific events
      eventSource.addEventListener("connected", (event) => {
        console.log("SSE connected event received:", event.data)
        setIsConnected(true)
        setConnectionError(null)
        setReconnectAttempts(0)
      })

      // Handle regular messages
      eventSource.onmessage = (event) => {
        try {
          const newMessage = JSON.parse(event.data)

          // Add new message if it doesn't already exist
          setMessages((prev) => {
            // Check if message already exists
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev
            }

            // Check if the user has scrolled up
            const scrollArea = scrollAreaRef.current
            if (scrollArea) {
              const { scrollTop, scrollHeight, clientHeight } = scrollArea
              const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50

              if (!isScrolledToBottom) {
                setHasNewMessages(true)
              }
            }

            return [...prev, newMessage]
          })
        } catch (error) {
          console.error("Error parsing SSE message:", error)
        }
      }

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("SSE Error:", error)
        setIsConnected(false)

        // Close the current connection
        eventSource.close()

        // Increment reconnect attempts
        setReconnectAttempts((prev) => prev + 1)

        // Calculate backoff time (exponential backoff with max of 30 seconds)
        const backoffTime = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000)

        setConnectionError(`Connection lost. Reconnecting in ${Math.round(backoffTime / 1000)}s...`)

        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`Attempting to reconnect SSE (attempt ${reconnectAttempts + 1})...`)
          setupEventSource()
        }, backoffTime)
      }

      eventSourceRef.current = eventSource
    }

    // Initial setup
    setupEventSource()

    // Clean up on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [orderId, reconnectAttempts])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (!hasNewMessages) {
      scrollToBottom()
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setHasNewMessages(false)
  }

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50

    if (isScrolledToBottom) {
      setHasNewMessages(false)
    }
  }

  // Function to get recent message history for AI context
  const getRecentMessageHistory = (count = 10) => {
    return messages.slice(-count).map((msg) => ({
      content: msg.content,
      isAI: !!msg.isAI,
      isClient: msg.isClient,
    }))
  }

  // Function to handle AI response
  const getAIResponse = async (message: string, tempId: string) => {
    setIsWaitingForAI(true)

    try {
      const response = await fetch("/api/chat/ai-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          message,
          messageHistory: getRecentMessageHistory(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const aiMessage = await response.json()

      // Add the AI message to the chat
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
    } finally {
      setIsWaitingForAI(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !session?.user || isSending) return

    setIsSending(true)

    // Generate a temporary ID for optimistic updates
    const tempId = `temp-${Date.now()}`

    // Create an optimistic message
    const optimisticMessage: Message = {
      id: -1, // Temporary ID
      tempId,
      content: newMessage,
      orderId,
      senderId: currentUserId,
      senderName: currentUser.username,
      createdAt: new Date(),
      isClient: currentUser.role === "CLIENT",
    }

    // Add the optimistic message to the UI immediately
    setMessages((prev) => [...prev, optimisticMessage])

    // Clear the input
    setNewMessage("")

    // Focus the textarea again
    textareaRef.current?.focus()

    try {
      console.log("Sending message with user ID:", currentUserId, "to order:", orderId)

      const response = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: optimisticMessage.content,
          tempId, // Send the tempId to match it later
        }),
      })

      // Try to parse the response JSON
      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        console.error("Failed to parse response JSON:", e)
        responseData = { error: "Invalid response format" }
      }

      if (!response.ok) {
        console.error("Error response:", response.status, responseData)

        // Mark the message as failed
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, failed: true } : m)))
        setIsSending(false)
        return
      }

      // Update the message in the UI
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...responseData, tempId } : m)))

      // If the user is a client, booster is offline, and AI assist is enabled, get an AI response
      if (currentUser.role === "CLIENT" && !boosterOnline && aiAssistEnabled) {
        // Get AI response after a short delay to make it feel more natural
        setTimeout(() => {
          getAIResponse(optimisticMessage.content, tempId)
        }, 1000)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Mark the message as failed
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, failed: true } : m)))
    } finally {
      setIsSending(false)
    }
  }

  const handleRetryMessage = async (tempId: string) => {
    // Find the failed message
    const failedMessage = messages.find((m) => m.tempId === tempId && m.failed)
    if (!failedMessage) return

    // Mark as retrying
    setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, failed: false, isRetrying: true } : m)))

    try {
      const response = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: failedMessage.content,
          tempId,
        }),
      })

      // Try to parse the response JSON
      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        console.error("Failed to parse response JSON:", e)
        responseData = { error: "Invalid response format" }
      }

      if (!response.ok) {
        console.error("Error retrying message:", response.status, responseData)

        // Mark the message as failed again
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, failed: true, isRetrying: false } : m)))
        return
      }

      // Update the message in the UI
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...responseData, tempId, isRetrying: false } : m)))

      // If the user is a client, booster is offline, and AI assist is enabled, get an AI response
      if (currentUser.role === "CLIENT" && !boosterOnline && aiAssistEnabled) {
        // Get AI response after a short delay to make it feel more natural
        setTimeout(() => {
          getAIResponse(failedMessage.content, tempId)
        }, 1000)
      }
    } catch (error) {
      console.error("Error retrying message:", error)

      // Mark the message as failed again
      setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, failed: true, isRetrying: false } : m)))
    }
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return "??"

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleManualReconnect = () => {
    setConnectionError("Reconnecting...")
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    // Reset reconnect attempts
    setReconnectAttempts(0)

    // Create a new EventSource
    const eventSource = new EventSource(`/api/chat/${orderId}`, {
      withCredentials: true,
    })
    eventSourceRef.current = eventSource

    // Set up event handlers
    eventSource.onopen = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      setConnectionError("Failed to reconnect. Try again.")
      eventSource.close()
    }
  }

  // Group messages by date and sender
  const groupedMessages = messages.reduce((groups: Message[][], message) => {
    const lastGroup = groups[groups.length - 1]

    // Format the date for comparison
    const messageDate = new Date(message.createdAt)
    const messageDay = messageDate.toDateString()

    // Check if we should start a new group
    if (
      !lastGroup ||
      lastGroup[0].senderId !== message.senderId ||
      lastGroup[0].isAI !== message.isAI || // Separate AI messages
      new Date(lastGroup[lastGroup.length - 1].createdAt).toDateString() !== messageDay ||
      // Group messages that are more than 5 minutes apart
      Math.abs(new Date(lastGroup[lastGroup.length - 1].createdAt).getTime() - messageDate.getTime()) > 5 * 60 * 1000
    ) {
      groups.push([message])
    } else {
      lastGroup.push(message)
    }

    return groups
  }, [])

  // Show loading state if session is loading
  if (!session) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-400">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2F3F] bg-[#1A1E2C]/50">
        <div className="flex items-center">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-400 mr-2" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400 mr-2" />
          )}
          <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        {connectionError && (
          <div className="flex items-center">
            <span className="text-xs text-amber-400 mr-2">{connectionError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualReconnect}
              className="h-7 px-2 text-xs bg-[#1E2230] border-[#2A2F3F] hover:bg-[#232838]"
            >
              Reconnect
            </Button>
          </div>
        )}

        {/* AI Assistant Toggle - Only show for clients */}
        {currentUser.role === "CLIENT" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ai-assist"
                    checked={aiAssistEnabled}
                    onCheckedChange={setAiAssistEnabled}
                    className="data-[state=checked]:bg-purple-600"
                  />
                  <Label htmlFor="ai-assist" className="text-xs flex items-center cursor-pointer">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Assistant
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">AI will respond when booster is offline</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any} onScroll={handleScroll}>
        <div className="space-y-6">
          {groupedMessages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </div>
          )}

          {groupedMessages.map((group, groupIndex) => {
            const isCurrentUser = group[0].senderId === currentUserId
            const isAI = !!group[0].isAI
            const firstMessageDate = new Date(group[0].createdAt)
            const showDate =
              groupIndex === 0 ||
              new Date(groupedMessages[groupIndex - 1][0].createdAt).toDateString() !== firstMessageDate.toDateString()

            return (
              <div key={`group-${groupIndex}`}>
               

                <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
                  >
                    <Avatar className="h-8 w-8 mt-1 border border-[#2A2F3F]">
                      {isAI ? (
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback
                          className={
                            group[0].isClient
                              ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                              : "bg-gradient-to-br from-green-600 to-emerald-600"
                          }
                        >
                          {getInitials(group[0].senderName)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="space-y-1">
                      <div
                        className={`text-xs ${isCurrentUser ? "text-right" : "text-left"} text-gray-400 mb-1 flex items-center ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        {isAI && <Bot className="h-3 w-3 mr-1 text-purple-400" />}
                        {isAI ? "AI Assistant" : group[0].senderName}
                      </div>

                      {group.map((message, messageIndex) => (
                        <div key={message.tempId || message.id} className="flex flex-col">
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isCurrentUser
                                ? "bg-blue-600 text-white"
                                : isAI
                                  ? "bg-purple-600/20 border border-purple-600/30 text-purple-100"
                                  : "bg-[#232838] border border-[#2A2F3F]"
                            } ${messageIndex === 0 ? (isCurrentUser ? "rounded-tr-none" : "rounded-tl-none") : ""}`}
                          >
                            {message.content}
                          </div>

                          {messageIndex === group.length - 1 && (
                            <div
                              className={`flex items-center text-xs text-gray-400 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              {format(new Date(message.createdAt), "h:mm a")}

                              {isCurrentUser && (
                                <span className="ml-1">
                                  {message.failed ? (
                                    <div className="flex items-center">
                                      <AlertCircle className="h-3 w-3 text-red-400 mr-1" />
                                      <button
                                        onClick={() => message.tempId && handleRetryMessage(message.tempId)}
                                        className="text-xs text-blue-400 hover:underline"
                                      >
                                        Retry
                                      </button>
                                    </div>
                                  ) : message.isRetrying ? (
                                    <RefreshCw className="h-3 w-3 animate-spin text-blue-400" />
                                  ) : (
                                    <Check className="h-3 w-3 text-green-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {isWaitingForAI && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8 mt-1 border border-[#2A2F3F]">
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="text-xs text-left text-gray-400 mb-1 flex items-center">
                    <Bot className="h-3 w-3 mr-1 text-purple-400" />
                    AI Assistant
                  </div>
                  <div className="rounded-lg px-3 py-2 bg-purple-600/20 border border-purple-600/30 text-purple-100 rounded-tl-none">
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

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {hasNewMessages && (
        <div className="absolute bottom-16 right-4">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full shadow-lg flex items-center gap-1 bg-[#1E2230] hover:bg-[#232838]"
            onClick={scrollToBottom}
          >
            <ArrowDownCircle className="h-4 w-4" />
            New messages
          </Button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#2A2F3F]">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder={isConnected ? "Type your message..." : "Reconnecting to chat..."}
            className="flex-1 resize-none min-h-[40px] max-h-[120px] bg-[#1E2230] border-[#2A2F3F] focus:border-blue-500 focus:ring-blue-500"
            rows={1}
            disabled={isSending || !isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isSending || !newMessage.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {!isConnected && !connectionError && (
          <div className="text-xs text-amber-400 mt-1 flex items-center">
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            Connecting to chat server...
          </div>
        )}
        {currentUser.role === "CLIENT" && !boosterOnline && aiAssistEnabled && (
          <div className="text-xs text-purple-400 mt-1 flex items-center">
            <Bot className="h-3 w-3 mr-1" />
            AI Assistant is active while booster is offline
          </div>
        )}
      </form>
    </div>
  )
}
