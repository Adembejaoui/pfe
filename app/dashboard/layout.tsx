import type React from "react"
import ClientDashboardLayout from "./clientLayout"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>
}
