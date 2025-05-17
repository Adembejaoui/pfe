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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface GameType {
  id: string
  name: string
  slug: string
  description: string | null
  game: {
    id: number
    name: string
    slug: string
  }
  _count: {
    orders: number
  }
}

export default function EditGameTypePage({ params }: { params: { id: string; typeId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gameType, setGameType] = useState<GameType | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  })

  useEffect(() => {
    const fetchGameType = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/games/${params.id}/game-types/${params.typeId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch game type details")
        }

        const gameType = await response.json()
        setGameType(gameType)

        form.reset({
          name: gameType.name,
          slug: gameType.slug,
          description: gameType.description || "",
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
  }, [params.id, params.typeId, form])

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true)

      const response = await fetch(`/api/admin/games/${params.id}/game-types/${params.typeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update game type")
      }

      toast.success("Game type updated successfully")
      router.push(`/admin/games/${params.id}`)
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

  if (!gameType) {
    return <div className="flex justify-center py-8">Game type not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/games/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Game Type</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Game Type Information</CardTitle>
          <CardDescription>Update the game type's details for {gameType.game.name}.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
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
