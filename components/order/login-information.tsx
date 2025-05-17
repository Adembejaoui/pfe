"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, User } from "lucide-react"

interface LoginInformationProps {
  username: string
  password: string
  server?: string
  tagLine?: string
}

export function LoginInformation({ username, password, server, tagLine }: LoginInformationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const toggleVisibility = () => {
    if (!isSubmitted) {
      setShowLoginForm(!showLoginForm)
    } else {
      setIsVisible(!isVisible)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setShowLoginForm(false)
    setIsVisible(true)
    // Dispatch custom event for other components
    window.dispatchEvent(new Event("loginSubmitted"))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!isSubmitted && !showLoginForm) {
    return (
      <div className="flex justify-center my-6">
        <Button
          onClick={toggleVisibility}
          variant="outline"
          className="bg-[#1A1E2C] border-[#2A2F3F] hover:bg-[#232838]"
        >
          <Lock className="w-4 h-4 mr-2" />
          Enter Account Information
        </Button>
      </div>
    )
  }

  if (showLoginForm) {
    return (
      <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
        <CardHeader className="border-b border-[#2A2F3F] bg-[#1A1E2C] px-4 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Login Information</CardTitle>
            <Button variant="ghost" size="sm" onClick={toggleVisibility} className="text-gray-400 hover:text-white">
              Hide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="username"
                  name="username"
                  value={loginData.username}
                  onChange={handleChange}
                  className="pl-10 bg-[#1E2230] border-[#2A2F3F] focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleChange}
                  className="pl-10 bg-[#1E2230] border-[#2A2F3F] focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#161A26] border-[#2A2F3F] shadow-lg">
      <CardHeader className="border-b border-[#2A2F3F] bg-[#1A1E2C] px-4 py-3">
        <CardTitle className="text-lg font-semibold">Login Information</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="divide-y divide-[#2A2F3F]">
          <div className="grid grid-cols-3 px-4 py-3">
            <dt className="text-gray-400 flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              Username
            </dt>
            <dd className="col-span-2 font-medium">{isSubmitted ? loginData.username : username}</dd>
          </div>
          <div className="grid grid-cols-3 px-4 py-3">
            <dt className="text-gray-400 flex items-center">
              <Lock className="w-4 h-4 mr-2 text-gray-500" />
              Password
            </dt>
            <dd className="col-span-2 font-medium flex items-center">
              <span className="mr-2">•••••••••</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
