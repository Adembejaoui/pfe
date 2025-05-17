"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ServerQueueSelectorProps {
  server: string
  queueType: string
  onServerChange: (value: string) => void
  onQueueTypeChange: (value: string) => void
  servers: string[]
  queueTypes: string[]
}

export default function ServerQueueSelector({
  server,
  queueType,
  onServerChange,
  onQueueTypeChange,
  servers,
  queueTypes,
}: ServerQueueSelectorProps) {
  return (
    <div className="bg-[#1a1a2e] border border-[#333355] rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🌐</span>
            </div>
            <h3 className="font-bold">Server</h3>
          </div>
          <Select value={server} onValueChange={onServerChange}>
            <SelectTrigger className="bg-[#2a0044] border-purple-900">
              <SelectValue placeholder="Server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🎮</span>
            </div>
            <h3 className="font-bold">Queue type</h3>
          </div>
          <Select value={queueType} onValueChange={onQueueTypeChange}>
            <SelectTrigger className="bg-[#2a0044] border-purple-900">
              <SelectValue placeholder="Queue Type" />
            </SelectTrigger>
            <SelectContent>
              {queueTypes.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
