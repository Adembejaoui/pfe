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
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>available Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<OrdersLoading />}>
              {userRole =="BOOSTER" &&
                <OrdersTable 
                  role={role} 
                  status={["PENDING"]}
                  enableRowClick={false}
                  showClaimButton={true} 
                />
              } 
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
