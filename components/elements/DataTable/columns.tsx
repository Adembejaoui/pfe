"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { type Review, reviewColumns } from "./reviews-columns"
import { type Order, orderColumns } from "./orders-columns"

// Helper function to get the appropriate columns with proper typing
export function getColumns<T extends "reviews" | "orders">(
  type: T,
  onClaim: (item: any) => void,
  onViewDetails: (item: any) => void,
  showClaimButton = false,
  role?: string,
): ColumnDef<any>[] {
  if (type === "reviews") {
    return reviewColumns(onClaim as (review: Review) => void, onViewDetails as (review: Review) => void)
  } else {
    return orderColumns(
      onClaim as (order: Order) => void,
      onViewDetails as (order: Order) => void,
      showClaimButton,
      role as "admin" | "booster" | "client" | undefined,
    )
  }
}

export const commonColumns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "project",
    header: "Project",
  },
  {
    accessorKey: "datetime",
    header: "Date Time",
    cell: ({ row }) => {
      const date = row.getValue("datetime") as string
      if (!date) return "N/A"
      try {
        return format(new Date(date), "PPp")
      } catch (error) {
        console.error("Date formatting error:", error)
        return String(date)
      }
    },
  },
]
