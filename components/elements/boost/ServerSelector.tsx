"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Server {
  id: string
  name: string
}

interface ServerSelectorProps {
  servers: Server[]
  value: string
  onChange: (value: string) => void
}

export default function ServerSelector({ servers, value, onChange }: ServerSelectorProps) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Server</h4>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-[#0f0f1a] border-[#333355] text-white">
          <SelectValue placeholder="Select server" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a2e] border-[#333355] text-white">
          {servers.map((server) => (
            <SelectItem key={server.id} value={server.id}>
              {server.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
