"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateGameTypeDialog } from "../../game-types/create-game-type-dialog"
interface GameType {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  options?: {
    currentRank?: boolean
    desiredRank?: boolean
    wins?: boolean
    placements?: boolean
  }
}

interface Game {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  attributes: any
  gameTypes: GameType[]
  createdAt: string
  updatedAt: string
  orders: Array<{
    id: number
    status: string
    price: number
    createdAt: string
    client: {
      id: number
      email: string
      username: string | null
    }
  }>
  _count: {
    orders: number
  }
}

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateTypeDialogOpen, setIsCreateTypeDialogOpen] = useState(false)
  const [gameTypeToDelete, setGameTypeToDelete] = useState<GameType | null>(null)
  const [isDeleteTypeDialogOpen, setIsDeleteTypeDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    } catch (err) {
      console.error("Error fetching game details:", err)
      setError("Failed to load game details")
      toast.error("Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGame = async () => {
    try {
      const response = await fetch(`/api/admin/games/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete game")
      }

      toast.success("Game deleted successfully")
      router.push("/admin/games")
    } catch (error) {
      console.error("Error deleting game:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete game")
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleDeleteGameType = async () => {
    if (!gameTypeToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/games/${params.id}/game-types/${gameTypeToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete game type")
      }

      toast.success("Game type deleted successfully")
      fetchGame() // Refresh the game data
    } catch (error) {
      console.error("Error deleting game type:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete game type")
    } finally {
      setIsDeleting(false)
      setIsDeleteTypeDialogOpen(false)
      setGameTypeToDelete(null)
    }
  }

  const handleGameTypeCreated = () => {
    setIsCreateTypeDialogOpen(false)
    fetchGame() // Refresh the game data
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

  // Helper function to safely render game type options
  const renderGameTypeOptions = (gameType: GameType) => {
    const options = gameType.options || {}
    return (
      <div className="flex flex-wrap gap-1">
        {options.currentRank && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Current Rank</span>
        )}
        {options.desiredRank && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Desired Rank</span>
        )}
        {options.wins && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Wins</span>}
        {options.placements && (
          <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Placements</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/games">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Game Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/games/${params.id}/edit`}>
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
                  This action cannot be undone. This will permanently delete the game and all associated data. You
                  cannot delete a game that has orders. Please delete all orders first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteGame} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
            <CardDescription>Basic information about the game.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p>{game.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p>{game.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Slug</h3>
                <p>{game.slug}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{game.description || "No description provided."}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p>{new Date(game.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{new Date(game.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Game usage statistics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Game Types</h3>
                <p className="text-2xl font-bold">{game.gameTypes?.length || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                <p className="text-2xl font-bold">{game._count.orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {game.imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Game Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={game.imageUrl || "/placeholder.svg"}
                alt={game.name}
                className="max-h-64 rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=256&width=256"
                  e.currentTarget.alt = "Failed to load image"
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Game Attributes</CardTitle>
          <CardDescription>Game-specific attributes used for orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {game.attributes ? (
            <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(game.attributes, null, 2)}</pre>
          ) : (
            <div className="text-muted-foreground">No attributes defined for this game.</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="gameTypes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gameTypes">Game Types</TabsTrigger>
          <TabsTrigger value="recentOrders">Recent Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="gameTypes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Game Types</h2>
            <Button onClick={() => setIsCreateTypeDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Game Type
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {!game.gameTypes || game.gameTypes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No game types found for this game.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Options</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.gameTypes.map((gameType) => (
                        <TableRow key={gameType.id}>
                          <TableCell>{gameType.id.substring(0, 8)}...</TableCell>
                          <TableCell>{gameType.name}</TableCell>
                          <TableCell>{gameType.slug}</TableCell>
                          <TableCell>{gameType.description || "-"}</TableCell>
                          <TableCell>{renderGameTypeOptions(gameType)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/games/${params.id}/game-types/${gameType.id}/edit`}>Edit</Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setGameTypeToDelete(gameType)
                                  setIsDeleteTypeDialogOpen(true)
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recentOrders" className="space-y-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Card>
            <CardContent className="pt-6">
              {!game.orders || game.orders.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No orders found for this game.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {game.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>{order.client.username || order.client.email}</TableCell>
                          <TableCell>${order.price.toFixed(2)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateGameTypeDialog
        open={isCreateTypeDialogOpen}
        onOpenChange={setIsCreateTypeDialogOpen}
        onGameTypeCreated={handleGameTypeCreated}
        gameId={game.id}
      />

      <AlertDialog open={isDeleteTypeDialogOpen} onOpenChange={setIsDeleteTypeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the game type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGameType}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
