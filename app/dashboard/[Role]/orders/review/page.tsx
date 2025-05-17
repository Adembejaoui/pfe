"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { DataTable } from "@/components/elements/DataTable/data-table"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Review } from "@/components/elements/DataTable/reviews-columns"
import { getColumns } from "@/components/elements/DataTable/columns"

// Order data
const reviewsData: Review[] = [
  {
    id: "REV-001",
    rating: 5,
    message: "Excellent service! The team was very professional and responsive.",     createdAt: "2023-09-15T10:30:00Z",
  },
  {
    id: "REV-002",
    rating: 4,
    message: "Good service overall, but there was a slight delay in delivery.",
    createdAt: "2023-09-14T14:20:00Z",
  },
]

export default function RoleDashboard() {
  const params = useParams()
  const role = params.Role as string

  const [reviews] = useState<Review[]>(reviewsData)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClaimR = (review: Review) => {
    toast.success(`You have claimed review ${review.id}`)
  }

  const handleViewDetailsR = (review: Review) => {
    toast.info(`Viewing details for review ${review.id}`)
  }

  const reviewColumns = getColumns("reviews", handleClaimR, handleViewDetailsR) as ColumnDef<Review>[]
  
  return (
    <div className="w-full max-w-full mx-auto py-4 px-2 sm:px-4 md:px-6 md:py-8">
      {/* Dashboard Header */}
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6">{role} Dashboard</h1>

      {/* Client Role Content */}
      {role === "Client" && (
        <div className="w-full overflow-hidden bg-white shadow-md rounded-lg p-2 sm:p-4 mb-6">
          <h1>LE CLIENT A L A POSSIBILITE DE CREER UN REVIEW A UN BOOSTER </h1>
        </div>
      )}

      {/* Booster Role Content */}
      {role === "Booster" && (
        <div className="w-full overflow-hidden bg-white shadow-md rounded-lg p-2 sm:p-4 mb-6">
          <DataTable columns={reviewColumns} data={reviews} searchKey="service" searchPlaceholder="Search reviews..." />
        </div>
      )}

      {/* Admin Role Content */}
      {role === "admin" && (
          <div className="relative w-full bg-white shadow-md rounded-lg mb-4">
            <DataTable columns={reviewColumns} data={reviews} searchKey="service" searchPlaceholder="Search reviews..." />
          </div>
          
      )}
    </div>
  )
}
