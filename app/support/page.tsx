"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  User,
  CreditCard,
  Shield,
  Gamepad2,
} from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import MainLayout from "../Mainlayout"

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
    const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    priority: "",
    subject: "",
    description: "",
    orderId: "",
  })

  const faqData = [
    {
      category: "account",
      title: "Account & Profile",
      icon: <User className="h-5 w-5 text-slate-500" />,
      questions: [
        {
          question: "How do I create an account?",
          answer:
            "Click the 'Sign Up' button in the top right corner, fill in your email, username, and password. You'll receive a verification email to activate your account.",
        },
        {
          question: "I forgot my password. How can I reset it?",
          answer:
            "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. The link expires in 24 hours for security.",
        },
        {
          question: "How do I become a booster?",
          answer:
            "Go to your profile settings and click 'Apply to be a Booster'. Fill out the application form with your gaming experience, skills, and bio. Our team will review your application within 2-3 business days.",
        },
        {
          question: "Can I change my username?",
          answer:
            "Yes, you can change your username in your profile settings. Note that your username must be unique and can only be changed once every 30 days.",
        },
      ],
    },
    {
      category: "orders",
      title: "Orders & Boosting",
      icon: <Gamepad2 className="h-5 w-5 text-slate-500" />,
      questions: [
        {
          question: "How do I place a boosting order?",
          answer:
            "Select your game, choose the boost type, configure your requirements, and proceed to checkout. You'll be matched with a qualified booster within 24 hours.",
        },
        {
          question: "Can I track my order progress?",
          answer:
            "Yes! You can track your order in real-time through your dashboard. You'll also receive notifications and can chat directly with your booster.",
        },
        {
          question: "What if I'm not satisfied with my boost?",
          answer:
            "We offer a satisfaction guarantee. If you're not happy with the service, contact support within 48 hours of completion for a refund or re-boost.",
        },
        {
          question: "How long does a typical boost take?",
          answer:
            "Boost duration varies by game and service type. Most rank boosts take 1-7 days, while achievement boosts can take 1-3 days. You'll see estimated completion times before ordering.",
        },
      ],
    },
    {
      category: "payment",
      title: "Payment & Billing",
      icon: <CreditCard className="h-5 w-5 text-slate-500" />,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various cryptocurrency options for secure transactions.",
        },
        {
          question: "When am I charged for my order?",
          answer:
            "Payment is processed immediately when you place your order. For longer boosts, we may offer payment plans or milestone-based billing.",
        },
        {
          question: "Can I get a refund?",
          answer:
            "Refunds are available before your boost starts or within 48 hours if you're unsatisfied. Partial refunds may be available for incomplete services.",
        },
        {
          question: "Do you offer discounts?",
          answer:
            "Yes! We offer discounts for first-time customers, bulk orders, and loyal clients. Check your account for available discount codes.",
        },
      ],
    },
    {
      category: "security",
      title: "Security & Safety",
      icon: <Shield className="h-5 w-5 text-slate-500" />,
      questions: [
        {
          question: "Is my account information safe?",
          answer:
            "Absolutely. We use industry-standard encryption and never store your game passwords. Our boosters use secure methods and VPNs to protect your account.",
        },
        {
          question: "Will my account get banned?",
          answer:
            "We take every precaution to ensure account safety. Our boosters are experienced professionals who follow game-specific safety protocols to minimize any risks.",
        },
        {
          question: "How do you verify your boosters?",
          answer:
            "All boosters go through a rigorous verification process including skill tests, background checks, and trial periods before being approved to work on client accounts.",
        },
        {
          question: "What if something goes wrong with my account?",
          answer:
            "In the rare event of account issues, we provide full support and compensation. We also offer account insurance for premium services.",
        },
      ],
    },
  ]

  const filteredFAQs = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create the feedback content with all form data
      const feedbackContent = `
SUPPORT REQUEST
===============
Name: ${formData.name}
Email: ${formData.email}
Category: ${formData.category}
Priority: ${formData.priority}
Subject: ${formData.subject}
Order ID: ${formData.orderId || "N/A"}

Description:
${formData.description}
      `.trim()

      const response = await fetch("/api/website-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedbackContent,
          userId: 1 , // You'll need to get the actual user ID from your auth system
          orderId: formData.orderId ? Number.parseInt(formData.orderId) : null,
          type: "support_request",
        }),
      })

      if (response.ok) {
        toast.success("Support request submitted!", {
          description: "We'll get back to you within 24 hours.",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          category: "",
          priority: "",
          subject: "",
          description: "",
          orderId: "",
        })
      } else {
        throw new Error("Failed to submit support request")
      }
    } catch (error) {
      toast.error("Failed to submit support request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Support Center</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Get help with your account, orders, and everything else. We're here to help you succeed.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-100">24/7 Support</h3>
              <p className="text-slate-300 text-sm">Round-the-clock assistance</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-100">Live Chat</h3>
              <p className="text-slate-300 text-sm">Instant help when you need it</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-100">99% Satisfaction</h3>
              <p className="text-slate-300 text-sm">Happy customers guaranteed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="faq"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              <HelpCircle className="h-4 w-4 text-slate-500" />
              Frequently Asked Questions
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex items-center gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100"
            >
              <Mail className="h-4 w-4 text-slate-500" />
              Contact Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-8">
            {/* Search */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Categories */}
            <div className="space-y-6">
              {filteredFAQs.map((category) => (
                <Card key={category.category} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-slate-100">
                      {category.icon}
                      {category.title}
                      <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                        {category.questions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.category}-${index}`}>
                          <AccordionTrigger className="text-left text-slate-100 hover:text-slate-200">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-300">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && searchQuery && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-100 mb-2">No results found</h3>
                  <p className="text-slate-300">
                    Try different keywords or contact our support team for personalized help.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Submit a Support Request</CardTitle>
                  <CardDescription className="text-slate-300">
                    Can't find what you're looking for? Send us a detailed message and we'll get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="account">Account & Profile</SelectItem>
                            <SelectItem value="orders">Orders & Boosting</SelectItem>
                            <SelectItem value="payment">Payment & Billing</SelectItem>
                            <SelectItem value="technical">Technical Issues</SelectItem>
                            <SelectItem value="security">Security Concerns</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => handleInputChange("priority", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderId">Order ID (if applicable)</Label>
                      <Input
                        id="orderId"
                        placeholder="Enter your order ID"
                        value={formData.orderId}
                        onChange={(e) => handleInputChange("orderId", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide detailed information about your issue..."
                        className="min-h-[120px] bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Support Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Other Ways to Reach Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-100">Email Support</p>
                        <p className="text-sm text-slate-300">contact@legendsboost.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-100">Live Chat</p>
                        <p className="text-sm text-slate-300">Available 24/7 in your dashboard</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-slate-100">Phone Support</p>
                        <p className="text-sm text-slate-300">+216 51 373 019</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="bg-slate-800 border-slate-700">
                  <AlertCircle className="h-4 w-4 text-slate-300" />
                  <AlertDescription className="text-slate-300">
                    <strong>Response Times:</strong> We typically respond to support requests within 2-4 hours during
                    business hours and within 24 hours on weekends.
                  </AlertDescription>
                </Alert>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Before You Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="text-slate-300">• Check our FAQ section above for quick answers</li>
                      <li className="text-slate-300">• Have your order ID ready if your question is order-related</li>
                      <li className="text-slate-300">• Include screenshots if you're experiencing technical issues</li>
                      <li className="text-slate-300">• Be as specific as possible about your problem</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </MainLayout>
  )
}
