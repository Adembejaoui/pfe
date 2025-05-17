"use client"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { OrdersTable } from "@/components/elements/DataTable/orders-table"
import { useSession } from "next-auth/react"

// Loading component for Suspense
function OrdersLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Loading orders...</span>
    </div>
  )
}

export default function OrdersPage({ params }: { params: { role: string } }) {
  const role = params.role as string
  // Validate role
  const { data: session, status } = useSession()
  const userRole = session?.user?.role

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Manage your active orders. Click on an order to view details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<OrdersLoading />}>
              {userRole =="CLIENT" &&
                <OrdersTable 
                  role={role} 
                  status={["PENDING", "IN_PROGRESS"]} 
                  showClaimButton={role === "booster"} 
                />
              }
              {userRole =="BOOSTER" &&
                <OrdersTable 
                  role={role} 
                  status={["IN_PROGRESS"]} 
                  showClaimButton={role === "booster"} 
                />
              } 
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>View your completed orders. Click on an order to view details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<OrdersLoading />}>
                <OrdersTable 
                  role={role} 
                  status={["COMPLETED"]} 
                  showClaimButton={false} 
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
