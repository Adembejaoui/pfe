"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Loader2, User, Clock, DollarSign, Gamepad2, Trophy, CheckCircle2, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define game options
const GAME_OPTIONS = [
  { value: "league-of-legends", label: "League of Legends" },
  { value: "valorant", label: "Valorant" },
  { value: "dota-2", label: "Dota 2" },
  { value: "counter-strike", label: "Counter-Strike" },
  { value: "overwatch", label: "Overwatch" },
  { value: "apex-legends", label: "Apex Legends" },
  { value: "fortnite", label: "Fortnite" },
  { value: "world-of-warcraft", label: "World of Warcraft" },
  { value: "other", label: "Other" },
]

// Define language options
const LANGUAGE_OPTIONS = [
  { id: "english", label: "English" },
  { id: "french", label: "French" },
  { id: "spanish", label: "Spanish" },
  { id: "german", label: "German" },
  { id: "chinese", label: "Chinese" },
  { id: "russian", label: "Russian" },
  { id: "portuguese", label: "Portuguese" },
  { id: "arabic", label: "Arabic" },
]

export default function UpgradePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    // Basic information
    bio: "",
    skills: "",
    experience: "",

    // Additional attributes
    languages: [] as string[],
    availability: "",
    availableHours: "",
    preferredGames: [] as string[],
    otherGames: "",
    achievements: "",
    socialLinks: "",
    hourlyRate: "",

    // Booster preferences
    boostingStyle: "",
    communicationPreference: "",
  })

  // Redirect if user is not logged in or is not a client
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/authentification")
    return null
  }

  if (session?.user?.role !== "CLIENT") {
  
    router.push("/")
    
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, [name]: [...(prev[name as keyof typeof prev] as string[]), value] }
      } else {
        return {
          ...prev,
          [name]: (prev[name as keyof typeof prev] as string[]).filter((item) => item !== value),
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields based on current step
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }

    // Final validation before submission
    const requiredFields = ["bio", "skills", "experience", "availability", "preferredGames"]

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData]
      return !value || (Array.isArray(value) && value.length === 0)
    })

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare data for submission
      const submitData = {
        ...formData,
        // Format any data if needed
        preferredGames: formData.preferredGames.includes("other")
          ? [...formData.preferredGames.filter((g) => g !== "other"), formData.otherGames]
          : formData.preferredGames,
      }

      const response = await fetch("/api/booster-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit request")
      }

      setSubmitted(true)
      toast.success("Your request has been submitted successfully!")
    } catch (error) {
      console.error("Error submitting booster request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>Request Submitted</CardTitle>
            </div>
            <CardDescription>Thank you for your interest in becoming a booster!</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Request Under Review
              </AlertTitle>
              <AlertDescription className="mt-2">
                Your request to become a booster has been submitted and is now pending admin approval. We will review
                your application and get back to you soon. You can continue using the platform as a client in the
                meantime.
              </AlertDescription>
            </Alert>

            <div className="mt-6 space-y-4">
              <h3 className="font-medium">What happens next?</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span>Our admin team will review your application (typically within 1-3 business days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span>You'll receive an email notification when your application status changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span>If approved, you'll gain access to the booster dashboard and can start accepting orders</span>
                </li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Have questions about your application? Contact our support team.
            </p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <Card className="border-blue-100 shadow-lg">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            Become a Booster
          </CardTitle>
          <CardDescription className="text-base">
            Join our team of professional boosters and earn money doing what you love.
          </CardDescription>

          {/* Progress indicator */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of 3</span>
              <span className="text-sm text-muted-foreground">
                {currentStep === 1
                  ? "Basic Information"
                  : currentStep === 2
                    ? "Gaming Profile"
                    : "Preferences & Availability"}
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-base">
                      Bio <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide a brief description about yourself that will be visible to clients.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-base">
                      Skills <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      placeholder="List your gaming skills and expertise..."
                      value={formData.skills}
                      onChange={handleChange}
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      List the games you're skilled at and any achievements or rankings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-base">
                      Experience <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      placeholder="Describe your previous boosting or coaching experience..."
                      value={formData.experience}
                      onChange={handleChange}
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Share your experience with boosting, coaching, or other relevant experience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Gaming Profile */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Gaming Profile</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base">
                      Preferred Games <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {GAME_OPTIONS.map((game) => (
                        <div key={game.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`game-${game.value}`}
                            checked={formData.preferredGames.includes(game.value)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("preferredGames", game.value, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`game-${game.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {game.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.preferredGames.includes("other") && (
                      <div className="pt-2">
                        <Label htmlFor="otherGames" className="text-sm">
                          Please specify other games
                        </Label>
                        <Input
                          id="otherGames"
                          name="otherGames"
                          placeholder="Enter other games you play..."
                          value={formData.otherGames}
                          onChange={handleChange}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">Select the games you want to boost in.</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="achievements" className="text-base">
                      Notable Achievements
                    </Label>
                    <Textarea
                      id="achievements"
                      name="achievements"
                      placeholder="List your gaming achievements, tournament wins, high ranks achieved, etc."
                      value={formData.achievements}
                      onChange={handleChange}
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Share your gaming accomplishments to showcase your expertise.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialLinks" className="text-base">
                      Social Media & Streaming Links
                    </Label>
                    <Textarea
                      id="socialLinks"
                      name="socialLinks"
                      placeholder="Twitch, YouTube, Twitter, Discord, etc."
                      value={formData.socialLinks}
                      onChange={handleChange}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Share your gaming profiles and social media accounts (one per line).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences & Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Preferences & Availability</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base">
                      Languages <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {LANGUAGE_OPTIONS.map((language) => (
                        <div key={language.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${language.id}`}
                            checked={formData.languages.includes(language.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange("languages", language.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`lang-${language.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {language.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select all languages you can communicate in with clients.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-base">
                      Weekly Availability <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => handleSelectChange("availability", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time (30+ hours/week)</SelectItem>
                        <SelectItem value="part-time">Part-time (15-30 hours/week)</SelectItem>
                        <SelectItem value="weekends">Weekends only</SelectItem>
                        <SelectItem value="evenings">Evenings only</SelectItem>
                        <SelectItem value="flexible">Flexible schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableHours" className="text-base">
                      Available Hours
                    </Label>
                    <Textarea
                      id="availableHours"
                      name="availableHours"
                      placeholder="Specify your available hours (e.g., Mon-Fri: 6PM-10PM, Sat-Sun: 10AM-8PM)"
                      value={formData.availableHours}
                      onChange={handleChange}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide more details about your availability schedule.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate" className="text-base">
                      Expected Hourly Rate
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="text"
                        placeholder="Your expected rate per hour"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      What is your expected hourly rate for boosting services?
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Boosting Style</Label>
                    <RadioGroup
                      value={formData.boostingStyle}
                      onValueChange={(value) => handleSelectChange("boostingStyle", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="efficient" id="style-efficient" />
                        <Label htmlFor="style-efficient">Efficient - Focus on results</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="educational" id="style-educational" />
                        <Label htmlFor="style-educational">Educational - Teach while boosting</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="flexible" id="style-flexible" />
                        <Label htmlFor="style-flexible">Flexible - Adapt to client needs</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Communication Preference</Label>
                    <RadioGroup
                      value={formData.communicationPreference}
                      onValueChange={(value) => handleSelectChange("communicationPreference", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="voice" id="comm-voice" />
                        <Label htmlFor="comm-voice">Voice chat preferred</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="comm-text" />
                        <Label htmlFor="comm-text">Text chat preferred</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="comm-both" />
                        <Label htmlFor="comm-both">Comfortable with both</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="flex w-full justify-between gap-4">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" className="ml-auto" onClick={() => setCurrentStep(currentStep + 1)}>
                  Next Step
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By submitting this form, you agree to our terms and conditions for boosters.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
