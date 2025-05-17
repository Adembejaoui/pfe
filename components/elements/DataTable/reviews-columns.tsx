"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { CheckCircle, Eye, MoreHorizontal, Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type Review = {
  id: string
  rating: number
  message: string
  createdAt: string
}

export const reviewColumns = (
  onClaim: (review: Review) => void,
  onViewDetails: (review: Review) => void,
): ColumnDef<Review>[] => [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => {
      const id = row.getValue("id") as string
      return (
        <div className="font-medium max-w-[100px] truncate" title={id}>
          {id}
        </div>
      )
    },
  },
  {
    header: "Rating",
    accessorKey: "rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <div className="flex text-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4" fill={i < rating ? "currentColor" : "none"} />
          ))}
        </div>
      )
    },
  },
  {
    header: "Message",
    accessorKey: "message",
    cell: ({ row }) => {
      const message = row.getValue("message") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] md:max-w-[300px] truncate">{message}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      if (!date) return "N/A"
      try {
        return format(new Date(date), "PPp")
      } catch (error) {
        console.error("Date formatting error:", error)
        return String(date)
      }
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const review = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(review)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClaim(review)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Claim
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
