"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

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
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Slug can only contain lowercase letters, numbers, and hyphens" }),
  description: z.string().optional(),
  options: z.object({
    currentRank: z.boolean().default(false),
    desiredRank: z.boolean().default(false),
    wins: z.boolean().default(false),
    placements: z.boolean().default(false),
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CreateGameTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGameTypeCreated: () => void
  gameId: number
}

export function CreateGameTypeDialog({ open, onOpenChange, onGameTypeCreated, gameId }: CreateGameTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      options: {
        currentRank: false,
        desiredRank: false,
        wins: false,
        placements: false,
      },
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/games/${gameId}/game-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create game type")
      }

      toast.success("Game type created successfully!")

      form.reset()
      onGameTypeCreated()
    } catch (error) {
      console.error("Error creating game type:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create game type")
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
          <DialogTitle>Create New Game Type</DialogTitle>
          <DialogDescription>
            Add a new boost type for this game. This will be available for customers to select.
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
                    <Input placeholder="Rank Boost" {...field} />
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
                      <Input placeholder="rank-boost" {...field} />
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
                    <Textarea placeholder="A brief description of this boost type..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Options</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                <FormField
                  control={form.control}
                  name="options.currentRank"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Current Rank</FormLabel>
                        <p className="text-sm text-muted-foreground">Customer needs to specify their current rank</p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="options.desiredRank"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Desired Rank</FormLabel>
                        <p className="text-sm text-muted-foreground">Customer needs to specify their desired rank</p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="options.wins"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Wins</FormLabel>
                        <p className="text-sm text-muted-foreground">Customer needs to specify number of wins</p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="options.placements"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Placements</FormLabel>
                        <p className="text-sm text-muted-foreground">Customer needs to specify placement matches</p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Game Type"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
