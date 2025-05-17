"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatMessage {
  id: string | number
  content: string
  senderId: number
  senderName: string
  createdAt: Date | string
  isClient: boolean
}

interface ChatProps {
  messages: ChatMessage[]
  clientId: number
  onSendMessage: (content: string) => void
  currentUser: {
    id: number
    username: string
  }
}

export function Chat({ messages, clientId, onSendMessage, currentUser }: ChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col bg-white bg-opacity-5 rounded-lg border border-[#1f2330] h-full">
      <header className="px-4 py-3 border-b border-[#1f2330]">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h2 className="text-lg font-semibold">Chat</h2>
        </div>
        <div className="text-xs text-gray-400">Currently online</div>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUser.id

          return (
            <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? "bg-blue-600" : "bg-[#1f2330]"}`}>
                <div className="text-xs text-gray-400 mb-1">
                  {message.senderName} •{" "}
                  {typeof message.createdAt === "string"
                    ? message.createdAt
                    : format(new Date(message.createdAt), "HH:mm")}
                </div>
                <div>{message.content}</div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <footer className="px-4 py-3 border-t border-[#1f2330]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border border-[#1f2330] rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}
