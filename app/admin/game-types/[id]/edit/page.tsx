"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Game {
  id: number
  name: string
  slug: string
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z.string().optional(),
  gameId: z.string().min(1, { message: "Please select a game" }),
})

type FormValues = z.infer<typeof formSchema>

export default function EditGameTypePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [games, setGames] = useState<Game[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      gameId: "",
    },
  })

  useEffect(() => {
    const fetchGameType = async () => {
      try {
        setLoading(true)

        // Fetch games first
        const gamesResponse = await fetch("/api/admin/games?limit=100")
        if (!gamesResponse.ok) {
          throw new Error("Failed to fetch games")
        }

        const gamesData = await gamesResponse.json()
        setGames(gamesData.games)

        // Then fetch the game type
        const response = await fetch(`/api/admin/game-types/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch game type details")
        }

        const gameType = await response.json()

        form.reset({
          name: gameType.name,
          slug: gameType.slug,
          description: gameType.description || "",
          gameId: String(gameType.gameId),
        })
      } catch (err) {
        console.error("Error fetching game type details:", err)
        setError("Failed to load game type details")
        toast.error("Failed to load game type details")
      } finally {
        setLoading(false)
      }
    }

    fetchGameType()
  }, [params.id, form])

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true)

      const response = await fetch(`/api/admin/game-types/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          gameId: Number(data.gameId),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update game type")
      }

      toast.success("Game type updated successfully")
      router.push(`/admin/game-types/${params.id}`)
    } catch (error) {
      console.error("Error updating game type:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update game type")
    } finally {
      setSubmitting(false)
    }
  }

  const generateSlug = () => {
    const name = form.getValues("name")
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
      form.setValue("slug", slug)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading game type details...</div>
  }

  if (error) {
    return <div className="flex justify-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/game-types/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Game Type</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Game Type Information</CardTitle>
          <CardDescription>Update the game type's details.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="gameId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {games.map((game) => (
                          <SelectItem key={game.id} value={String(game.id)}>
                            {game.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Rank Boosting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="rank-boosting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generate
                </Button>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief description of the game type..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
