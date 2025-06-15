"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { MenuIcon, ShieldCheck, User } from "lucide-react"
import SpecialButton from "../ui/SpecialButton"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, Settings, UserIcon } from "lucide-react"

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const navLinks = ["Home", "support", "gameBoost"]
  const userRole = session?.user.role
  const accountMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/dashboard/${userRole}`,
    },
    {
      label: "Profile",
      icon: UserIcon,
      href: `/dashboard/${userRole}/profile`,
    },
  ]



  return (
    <div className="sticky top-0 z-50 w-full bg-[#030303] text-white/80">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image
              src="https://xou955y8kd.ufs.sh/f/zvC4KODelhDMb2PpuB5iFWtAgHVDXY3jywaQ50s2hvOqKm7G" // Replace with your actual logo path
              alt="Logo legends boost"
              width={100}
              height={100}
              className="h-6 w-6 object-contain"
          />

        <p className="text-[1.1rem] md:text-[1.3rem] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
          Legends Boost
        </p>
</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((item) => {
            const linkPath = item === "Home" ? "/" : `/${item.toLowerCase()}`
            const isActive = pathname === linkPath

            return (
              <Link key={item} href={linkPath} className="text-gray-200 flex items-center gap-2" prefetch={false}>
                <div
                  className={`w-1 h-1 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-white/40"}`}
                />
                {item}
              </Link>
            )
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Account Button */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 rounded-full px-4 py-2"
                >
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountMenuItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="cursor-pointer">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin}/authentification` })}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SpecialButton
              icon={<User className="w-4 h-4" />}
              text="Sign In"
              href="/authentification"
              className="hidden md:flex"
            />
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className=" bg-white/90 text-black/90 rounded-full md:hidden">
                <MenuIcon size={20} />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Sidebar */}
            <SheetContent side="right" className=" border-none text-black/90">
              <SheetTitle className="text-white/90 my-6">
                <Link href="/" className="flex items-center gap-2" prefetch={false}>
                  <ShieldCheck className="h-10 w-10 text-black" />
                  <p className="text-[1.2rem] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-black to-black/80">
                    Legends Boost
                  </p>
                </Link>
              </SheetTitle>

              {/* Mobile Navigation */}
              <div className="grid gap-6 p-4 mt-4">
                {navLinks.map((item) => {
                  const linkPath = item === "Home" ? "/" : `/${item.toLowerCase()}`
                  const isActive = pathname === linkPath

                  return (
                    <Link
                      key={item}
                      href={linkPath}
                      onClick={() => setIsOpen(false)} // Close sheet on click
                      className="text-[.9rem] font-medium text-black/50 flex items-center gap-4"
                      prefetch={false}
                    >
                      <div
                        className={`w-1 h-1 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-black/90"}`}
                      />
                      {item}
                    </Link>
                  )
                })}
              </div>

              {session?.user ? (
                <div className="mt-8 space-y-3">
                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-[.9rem] font-medium text-black/80"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-[.9rem] font-medium text-black/80 p-0 h-auto"
                    onClick={() =>
                      signOut({ redirect: true, callbackUrl: `${window.location.origin}/authentification` })
                    }
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <SpecialButton
                  icon={<User className="w-4 h-4" />}
                  text="sign in"
                  href="/authentification"
                  className="mt-44"
                />
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
