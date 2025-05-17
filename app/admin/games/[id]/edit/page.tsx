"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { GameAttributeEditor } from "@/components/game-attribute-editor"

interface Game {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  attributes: any
}

export default function EditGamePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    attributes: {},
  })

  useEffect(() => {
    fetchGame()
  }, [params.id])

  const fetchGame = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/games/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch game details")
      }

      const data = await response.json()
      setGame(data)
      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        attributes: data.attributes || {},
      })
    } catch (err) {
      console.error("Error fetching game details:", err)
      setError("Failed to load game details")
      toast.error("Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAttributesChange = (attributes: any) => {
    setFormData((prev) => ({ ...prev, attributes }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/games/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update game")
      }

      toast.success("Game updated successfully")
      router.push(`/admin/games/${params.id}`)
    } catch (error) {
      console.error("Error updating game:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update game")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading game details...</div>
  }

  if (error) {
    return <div className="flex justify-center py-8 text-red-500">{error}</div>
  }

  if (!game) {
    return <div className="flex justify-center py-8">Game not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/games/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Game</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="attributes">Game Attributes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required />
                    <p className="text-sm text-muted-foreground">
                      This will be used in the URL. Use lowercase letters, numbers, and hyphens only.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4 mt-4">
            <Card>
              <CardContent className="pt-6">
                <GameAttributeEditor initialValue={formData.attributes} onChange={handleAttributesChange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
