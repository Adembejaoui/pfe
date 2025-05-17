"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Booster {
  id: number
  email: string
  username: string | null
}

const formSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
    required_error: "Please select a status",
  }),
  boosterId: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
})

type FormValues = z.infer<typeof formSchema>

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [boosters, setBoosters] = useState<Booster[]>([])
  const [gameAttributes, setGameAttributes] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "PENDING",
      boosterId: "",
      price: "0",
    },
  })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/orders/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const order = await response.json()

        form.reset({
          status: order.status,
          boosterId: order.boosterId ? String(order.boosterId) : "",
          price: String(order.price),
        })

        // Store game attributes for display
        if (order.game && order.game.attributes) {
          setGameAttributes(order.game.attributes)
        }

        // Fetch boosters
        fetchBoosters()
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    const fetchBoosters = async () => {
      try {
        const response = await fetch("/api/admin/users?role=BOOSTER&limit=100")

        if (!response.ok) {
          throw new Error("Failed to fetch boosters")
        }

        const data = await response.json()
        setBoosters(data.users)
      } catch (err) {
        console.error("Error fetching boosters:", err)
        /*toast({
          title: "Error",
          description: "Failed to load boosters",
          variant: "destructive",
        })*/
      }
    }

    fetchOrder()
  }, [params.id, form])

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true)

      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: data.status,
          boosterId: data.boosterId ? Number(data.boosterId) : null,
          price: Number(data.price),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update order")
      }

      /*toast({
        title: "Order updated",
        description: "The order has been successfully updated",
      })*/

      router.push(`/admin/orders/${params.id}`)
    } catch (error) {
      console.error("Error updating order:", error)
      /*toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order",
        variant: "destructive",
      })*/
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading order details...</div>
  }

  if (error) {
    return <div className="flex justify-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/orders/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Order Information</CardTitle>
          <CardDescription>Update the order's status, booster assignment, and details.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="boosterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Booster</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a booster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">No Booster (Unassigned)</SelectItem>
                        {boosters.map((booster) => (
                          <SelectItem key={booster.id} value={String(booster.id)}>
                            {booster.username || booster.email}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {gameAttributes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Game Attributes</h3>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-xs overflow-auto">{JSON.stringify(gameAttributes, null, 2)}</pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These attributes are defined at the game level and cannot be edited here.
                  </p>
                </div>
              )}
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
