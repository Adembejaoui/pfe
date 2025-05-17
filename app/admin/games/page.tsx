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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateGameDialog } from "@/app/admin/games/create-game-dialog"
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
  description: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  _count: {
    gameTypes: number
    orders: number
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface GamesResponse {
  games: Game[]
  pagination: PaginationData
}

export default function GamesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "10")

  useEffect(() => {
    fetchGames()
  }, [page, limit, searchTerm])

  const fetchGames = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/games?page=${page}&limit=${limit}`
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch games")
      }

      const data: GamesResponse = await response.json()
      setGames(data.games)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching games:", err)
      setError("Failed to load games")
      toast.error("Failed to load games")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ page: 1 })
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

    router.push(`/admin/games?${newParams.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage })
  }

  const handleGameCreated = () => {
    setIsCreateDialogOpen(false)
    fetchGames()
  }

  const handleDeleteGame = async () => {
    if (!gameToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/games/${gameToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete game")
      }

      toast.success("Game deleted successfully")
      fetchGames()
    } catch (error) {
      console.error("Error deleting game:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete game")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setGameToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground">Manage games available on your platform.</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Games</CardTitle>
          <CardDescription>
            A list of all games in your platform including their game types and order counts.
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
          </div>

          {loading ? (
            <div className="flex justify-center py-8">Loading games...</div>
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
                    <TableHead>Game Types</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No games found
                      </TableCell>
                    </TableRow>
                  ) : (
                    games.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>{game.id}</TableCell>
                        <TableCell>
                          <Link href={`/admin/games/${game.id}`} className="hover:underline text-blue-600">
                            {game.name}
                          </Link>
                        </TableCell>
                        <TableCell>{game.slug}</TableCell>
                        <TableCell>{game._count.gameTypes}</TableCell>
                        <TableCell>{game._count.orders}</TableCell>
                        <TableCell>{new Date(game.createdAt).toLocaleDateString()}</TableCell>
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
                                <Link href={`/admin/games/${game.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/games/${game.id}/edit`}>Edit Game</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setGameToDelete(game)
                                  setIsDeleteDialogOpen(true)
                                }}
                                disabled={game._count.gameTypes > 0}
                              >
                                Delete Game
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
            Showing {games.length} of {pagination.total} games
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

      <CreateGameDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onGameCreated={handleGameCreated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the game.
              {gameToDelete && gameToDelete._count.gameTypes > 0 && (
                <p className="mt-2 text-red-500 font-semibold">
                  Warning: This game has {gameToDelete._count.gameTypes} associated game types. You cannot delete a game
                  with existing game types.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGame}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting || (gameToDelete && gameToDelete._count.gameTypes > 0) || true}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
