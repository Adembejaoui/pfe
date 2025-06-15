"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, Home } from "lucide-react"
import MainLayout from "../Mainlayout"

export default function UnauthorizedPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    // Redirect based on user role
    if (session?.user?.role === "ADMIN") {
      router.push("/admin")
    } else if (session?.user?.role === "BOOSTER") {
      router.push("/dashboard/Booster/orders/available")
    } else if (session?.user?.role === "CLIENT") {
      router.push("/dashboard/Client/orders/active")
    } else {
      router.push("/")
    }
  }

  return (
    <MainLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">Access Denied</CardTitle>
          <CardDescription className="mt-2">You don't have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {session?.user?.role && (
              <p>
                Your current role: <span className="font-medium">{session.user.role}</span>
              </p>
            )}
            <p className="mt-1">If you believe this is an error, please contact your administrator.</p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </MainLayout>
  )
}
