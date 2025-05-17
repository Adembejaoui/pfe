"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export default function RiotAccountForm() {
  const [gameName, setGameName] = useState("")
  const [tagLine, setTagLine] = useState("")
  const [account, setAccount] = useState<RiotAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gameName || !tagLine) {
      setError("Game name and tag line are required")
      return
    }

    setLoading(true)
    setError(null)
    setAccount(null)

    try {
      const response = await fetch(
        `/api/account?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch account data")
      }

      const data = await response.json()
      setAccount(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Riot Account Lookup</CardTitle>
        <CardDescription>Enter a Riot ID to find account information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameName">Game Name</Label>
            <Input
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagLine">Tag Line</Label>
            <Input
              id="tagLine"
              value={tagLine}
              onChange={(e) => setTagLine(e.target.value)}
              placeholder="Enter tag line (e.g., NA1)"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {account && (
          <div className="mt-6 p-4 border rounded-md bg-muted">
            <h3 className="font-medium text-lg mb-2">Account Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">PUUID:</div>
              <div className="text-sm break-all">{account.puuid}</div>
              <div className="text-sm font-medium">Game Name:</div>
              <div className="text-sm">{account.gameName}</div>
              <div className="text-sm font-medium">Tag Line:</div>
              <div className="text-sm">{account.tagLine}</div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">Data provided by Riot Games API</CardFooter>
    </Card>
  )
}
