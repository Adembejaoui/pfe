"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GameType {
  id: number
  name: string
  slug: string
  description: string | null
  gameId: number
  createdAt: string
  updatedAt: string
  game: {
    id: number
    name: string
    slug: string
  }
  _count: {
    orders: number
  }
}

export default function GameTypeDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [gameType, setGameType] = useState<GameType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchGameType()
  }, [params.id])

  const fetchGameType = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/game-types/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch game type details")
      }

      const data = await response.json()
      setGameType(data)
    } catch (err) {
      console.error("Error fetching game type details:", err)
      setError("Failed to load game type details")
      toast.error("Failed to load game type details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGameType = async () => {
    try {
      const response = await fetch(`/api/admin/game-types/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete game type")
      }

      toast.success("Game type deleted successfully")
      router.push("/admin/game-types")
    } catch (error) {
      console.error("Error deleting game type:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete game type")
    } finally {
      setIsDeleteDialogOpen(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/game-types">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Game Type Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/game-types/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the game type.
                  {gameType._count.orders > 0 && (
                    <p className="mt-2 text-red-500 font-semibold">
                      Warning: This game type has {gameType._count.orders} associated orders. You cannot delete a game
                      type with existing orders.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGameType}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={gameType._count.orders > 0}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Game Type Information</CardTitle>
          <CardDescription>Basic information about this game type.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p>{gameType.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p>{gameType.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Slug</h3>
              <p>{gameType.slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p>{gameType.description || "No description provided."}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Game</h3>
              <p>
                <Link href={`/admin/games/${gameType.game.id}`} className="text-blue-600 hover:underline">
                  {gameType.game.name}
                </Link>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
              <p>{new Date(gameType.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p>{new Date(gameType.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Orders</h3>
              <p>{gameType._count.orders}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
