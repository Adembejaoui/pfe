"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateGameTypeDialog } from "@/app/admin/game-types/create-game-type-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define types
interface Game {
  id: number
  name: string
  slug: string
}

interface GameType {
  id: number
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

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface GameTypesResponse {
  gameTypes: GameType[]
  pagination: PaginationData
}

interface GamesResponse {
  games: Game[]
}

export default function GameTypesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [gameTypes, setGameTypes] = useState<GameType[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [gameId, setGameId] = useState(searchParams.get("gameId") || "")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [gameTypeToDelete, setGameTypeToDelete] = useState<GameType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")

  useEffect(() => {
    fetchGameTypes()
    fetchGames()
  }, [page, limit, searchTerm, gameId])

  const fetchGameTypes = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/game-types?page=${page}&limit=${limit}`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
      if (gameId) url += `&gameId=${encodeURIComponent(gameId)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch game types")
      }

      const data: GameTypesResponse = await response.json()
      setGameTypes(data.gameTypes)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching game types:", err)
      setError("Failed to load game types")
      toast.error("Failed to load game types")
    } finally {
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    try {
      const response = await fetch("/api/admin/games?limit=100")

      if (!response.ok) {
        throw new Error("Failed to fetch games")
      }

      const data: GamesResponse = await response.json()
      setGames(data.games)
    } catch (err) {
      console.error("Error fetching games:", err)
      toast.error("Failed to load games")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ page: 1 })
  }

  const handleGameChange = (value: string) => {
    setGameId(value)
    updateSearchParams({ gameId: value, page: 1 })
  }

  const updateSearchParams = (params: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    })

    router.push(`/admin/game-types?${newParams.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
  }

  const handleGameTypeCreated = () => {
    setIsCreateDialogOpen(false)
    fetchGameTypes()
  }

  const handleDeleteGameType = async () => {
    if (!gameTypeToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/game-types/${gameTypeToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete game type")
      }

      toast.success("Game type deleted successfully")
      fetchGameTypes()
    } catch (error) {
      console.error("Error deleting game type:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete game type")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setGameTypeToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Types</h1>
          <p className="text-muted-foreground">Manage game types available on your platform.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Game Types</CardTitle>
          <CardDescription>
            A list of all game types in your platform including their associated games and order counts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <Select value={gameId} onValueChange={handleGameChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {games.map((game) => (
                  <SelectItem key={game.id} value={String(game.id)}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading game types...</div>
          ) : error ? (
            <div className="flex justify-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No game types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    gameTypes.map((gameType) => (
                      <TableRow key={gameType.id}>
                        <TableCell>{gameType.id}</TableCell>
                        <TableCell>
                          <Link href={`/admin/game-types/${gameType.id}`} className="hover:underline text-blue-600">
                            {gameType.name}
                          </Link>
                        </TableCell>
                        <TableCell>{gameType.slug}</TableCell>
                        <TableCell>
                          <Link href={`/admin/games/${gameType.game.id}`} className="hover:underline text-blue-600">
                            {gameType.game.name}
                          </Link>
                        </TableCell>
                        <TableCell>{gameType._count.orders}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/game-types/${gameType.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/game-types/${gameType.id}/edit`}>Edit Game Type</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setGameTypeToDelete(gameType)
                                  setIsDeleteDialogOpen(true)
                                }}
                                disabled={gameType._count.orders > 0}
                              >
                                Delete Game Type
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {gameTypes.length} of {pagination.total} game types
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={pagination.page <= 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page >= pagination.pages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CreateGameTypeDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGameTypeCreated={handleGameTypeCreated}
        games={games}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the game type.
              {gameTypeToDelete && gameTypeToDelete._count.orders > 0 && (
                <p className="mt-2 text-red-500 font-semibold">
                  Warning: This game type has {gameTypeToDelete._count.orders} associated orders. You cannot delete a
                  game type with existing orders.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGameType}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting || (gameTypeToDelete && gameTypeToDelete._count.orders > 0)|| false} 
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
