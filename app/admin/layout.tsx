import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { BarChart3, Users, GamepadIcon, ListTodo, Settings, LogOut, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for game boosting service",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // In a real app, you would check the session and redirect if not admin
  // const session = await getServerSession()
  // if (!session || session.user.role !== "ADMIN") {
  //   redirect("/login")
  // }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <Users className="h-5 w-5" />
                Users
              </Link>
              <Link
                href="/admin/games"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <GamepadIcon className="h-5 w-5" />
                Games
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <ListTodo className="h-5 w-5" />
                Orders
              </Link>
              
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <GamepadIcon className="h-6 w-6" />
          <span>Boost Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
            <Link
              href="/admin/games"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <GamepadIcon className="h-4 w-4" />
              Games
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <ListTodo className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/booster-requests"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            >
              <ListTodo className="h-4 w-4" />
              Booster requests
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
