"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  User,
  Calendar,
  Clock,
  Globe,
  Gamepad2,
  Trophy,
  DollarSign,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define types
interface BoosterRequest {
  id: number
  userId: number
  bio: string
  skills: string
  experience: string
  attributes: {
    languages: string[]
    availability: string
    availableHours: string
    preferredGames: string[]
    achievements: string
    socialLinks: string
    hourlyRate: string
    boostingStyle: string
    communicationPreference: string
  }
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
  user: {
    id: number
    email: string
    username: string | null
  }
}

interface PaginationData {
  total: number
  page: number
  limit: number
  pages: number
}

interface BoosterRequestsResponse {
  requests: BoosterRequest[]
  pagination: PaginationData
}

export default function BoosterRequestsPage() {
  const router = useRouter()

  const [requests, setRequests] = useState<BoosterRequest[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<BoosterRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterGame, setFilterGame] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [pagination.page, activeTab, searchTerm, filterGame])

  // Update the fetchRequests function to handle permission errors better
  const fetchRequests = async () => {
    try {
      setLoading(true)

      let url = `/api/admin/booster-requests?page=${pagination.page}&limit=${pagination.limit}`

      if (activeTab !== "all") {
        url += `&status=${activeTab.toUpperCase()}`
      }

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`
      }

      if (filterGame && filterGame !== "all") {
        url += `&game=${encodeURIComponent(filterGame)}`
      }

      const response = await fetch(url)

      if (response.status === 403) {
        setError("You don't have permission to access this resource")
        toast.error("Access denied. You need admin privileges to view this page.")
        router.push("/dashboard")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch booster requests")
      }

      const data: BoosterRequestsResponse = await response.json()
      setRequests(data.requests)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching booster requests:", err)
      setError("Failed to load booster requests")
      toast.error("Failed to load booster requests")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleViewDetails = (request: BoosterRequest) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const handleProcessRequest = async (requestId: number, approve: boolean) => {
    try {
      setIsProcessing(true)

      const response = await fetch(`/api/admin/booster-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approve ? "APPROVED" : "REJECTED",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process request")
      }

      toast.success(`Request ${approve ? "approved" : "rejected"} successfully`)
      fetchRequests()
      setIsDetailsOpen(false)
    } catch (error) {
      console.error("Error processing request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRequests()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatAvailability = (availability: string) => {
    switch (availability) {
      case "full-time":
        return "Full-time (30+ hrs/week)"
      case "part-time":
        return "Part-time (15-30 hrs/week)"
      case "weekends":
        return "Weekends only"
      case "evenings":
        return "Evenings only"
      case "flexible":
        return "Flexible schedule"
      default:
        return availability
    }
  }

  // Update the main component return to center the content
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booster Requests</h1>
          <p className="text-muted-foreground">Manage requests from users who want to become boosters.</p>
        </div>
      </div>

      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle>All Requests</CardTitle>
          <CardDescription>Review and process booster applications from users.</CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Select value={filterGame} onValueChange={setFilterGame}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="league-of-legends">League of Legends</SelectItem>
                <SelectItem value="valorant">Valorant</SelectItem>
                <SelectItem value="dota-2">Dota 2</SelectItem>
                <SelectItem value="counter-strike">Counter-Strike</SelectItem>
                <SelectItem value="overwatch">Overwatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="pt-6">
            <TabsContent value="pending" className="m-0">
              {renderRequestsTable()}
            </TabsContent>
            <TabsContent value="approved" className="m-0">
              {renderRequestsTable()}
            </TabsContent>
            <TabsContent value="rejected" className="m-0">
              {renderRequestsTable()}
            </TabsContent>
          </CardContent>
        </Tabs>

        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {requests.length} of {pagination.total} requests
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
              Page {pagination.page} of {pagination.pages || 1}
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

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Booster Request Details
                </DialogTitle>
                <DialogDescription>
                  Request from {selectedRequest.user.username || selectedRequest.user.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">User Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {selectedRequest.userId} | Email: {selectedRequest.user.email}
                    </p>
                  </div>
                  <div>
                    <Badge
                      className={
                        selectedRequest.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedRequest.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Bio</h3>
                    </div>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedRequest.bio}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Skills</h3>
                    </div>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedRequest.skills}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium">Experience</h3>
                  </div>
                  <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedRequest.experience}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Preferred Games</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.attributes.preferredGames.map((game, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Languages</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.attributes.languages.length > 0 ? (
                        selectedRequest.attributes.languages.map((language, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50">
                            {language}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No languages specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Availability</h3>
                    </div>
                    <p className="text-sm">{formatAvailability(selectedRequest.attributes.availability)}</p>
                    {selectedRequest.attributes.availableHours && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded-md">
                        {selectedRequest.attributes.availableHours}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Expected Rate</h3>
                    </div>
                    <p className="text-sm">
                      {selectedRequest.attributes.hourlyRate
                        ? `$${selectedRequest.attributes.hourlyRate}/hour`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {selectedRequest.attributes.achievements && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Notable Achievements</h3>
                    </div>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedRequest.attributes.achievements}
                    </p>
                  </div>
                )}

                {selectedRequest.attributes.socialLinks && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium">Social Media & Streaming Links</h3>
                    </div>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">
                      {selectedRequest.attributes.socialLinks}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedRequest.attributes.boostingStyle && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Gamepad2 className="h-4 w-4 text-blue-600" />
                        <h3 className="font-medium">Boosting Style</h3>
                      </div>
                      <p className="text-sm">
                        {selectedRequest.attributes.boostingStyle === "efficient" && "Efficient - Focus on results"}
                        {selectedRequest.attributes.boostingStyle === "educational" &&
                          "Educational - Teach while boosting"}
                        {selectedRequest.attributes.boostingStyle === "flexible" && "Flexible - Adapt to client needs"}
                      </p>
                    </div>
                  )}

                  {selectedRequest.attributes.communicationPreference && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h3 className="font-medium">Communication Preference</h3>
                      </div>
                      <p className="text-sm">
                        {selectedRequest.attributes.communicationPreference === "voice" && "Voice chat preferred"}
                        {selectedRequest.attributes.communicationPreference === "text" && "Text chat preferred"}
                        {selectedRequest.attributes.communicationPreference === "both" && "Comfortable with both"}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium">Request Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created: {new Date(selectedRequest.createdAt).toLocaleString()} | Updated:{" "}
                    {new Date(selectedRequest.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <DialogFooter>
                {selectedRequest.status === "PENDING" && (
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleProcessRequest(selectedRequest.id, false)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleProcessRequest(selectedRequest.id, true)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderRequestsTable() {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    }

    if (error) {
      return <div className="flex justify-center py-8 text-red-500">{error}</div>
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Games</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No {activeTab} booster requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.user.username || "N/A"}</TableCell>
                  <TableCell>{request.user.email}</TableCell>
                  <TableCell>
                    {request.attributes.preferredGames && request.attributes.preferredGames.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {request.attributes.preferredGames.slice(0, 2).map((game, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {game}
                          </Badge>
                        ))}
                        {request.attributes.preferredGames.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{request.attributes.preferredGames.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    {request.attributes.availability ? formatAvailability(request.attributes.availability) : "N/A"}
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )
  }
}
