"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface CreateGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGameCreated: () => void
}

export function CreateGameDialog({ open, onOpenChange, onGameCreated }: CreateGameDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attributes, setAttributes] = useState<Record<string, string[]>>({})
  const [attributeKey, setAttributeKey] = useState("")
  const [attributeValue, setAttributeValue] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
    },
  })

  const addAttributeValue = () => {
    if (!attributeKey.trim()) {
      toast.error("Please enter an attribute key")
      return
    }
    if (!attributeValue.trim()) {
      toast.error("Please enter an attribute value")
      return
    }

    setAttributes((prev) => {
      const newAttributes = { ...prev }
      if (!newAttributes[attributeKey]) {
        newAttributes[attributeKey] = []
      } else if (!Array.isArray(newAttributes[attributeKey])) {
        // Convert to array if it's not already
        newAttributes[attributeKey] = [String(newAttributes[attributeKey])]
      }

      if (!newAttributes[attributeKey].includes(attributeValue)) {
        newAttributes[attributeKey] = [...newAttributes[attributeKey], attributeValue]
      }
      return newAttributes
    })
    setAttributeValue("")
  }

  const removeAttributeValue = (key: string, value: string) => {
    setAttributes((prev) => {
      const newAttributes = { ...prev }
      newAttributes[key] = newAttributes[key].filter((v) => v !== value)
      if (newAttributes[key].length === 0) {
        delete newAttributes[key]
      }
      return newAttributes
    })
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/admin/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          attributes, // Send attributes directly as an object
          gameTypes: [], // Initialize with empty array
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create game")
      }

      toast.success("Game created successfully!")

      form.reset()
      setAttributes({})
      setAttributeKey("")
      setAttributeValue("")
      onGameCreated()
    } catch (error) {
      console.error("Error creating game:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create game")
    } finally {
      setIsSubmitting(false)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Game</DialogTitle>
          <DialogDescription>
            Add a new game to your platform. This will be available for boosting services.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="League of Legends" {...field} />
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
                      <Input placeholder="league-of-legends" {...field} />
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
                    <Textarea placeholder="A brief description of the game..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Attributes</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    placeholder="Attribute key (e.g. ranks)"
                    value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Value (e.g. Bronze)"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addAttributeValue()
                      }
                    }}
                  />
                  <Button type="button" size="icon" onClick={addAttributeValue}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {Object.keys(attributes).length > 0 && (
                <div className="border rounded-md p-3 space-y-3">
                  {Object.entries(attributes).map(([key, values]) => (
                    <div key={key} className="space-y-2">
                      <div className="font-medium">{key}</div>
                      <div className="flex flex-wrap gap-2">
                        {values.map((value) => (
                          <Badge key={`${key}-${value}`} variant="secondary" className="flex items-center gap-1">
                            {value}
                            <button
                              type="button"
                              onClick={() => removeAttributeValue(key, value)}
                              className="ml-1 rounded-full hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove</span>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Game"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
