"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Trash2, ChevronDown, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface GameAttributeEditorProps {
  initialValue: any
  onChange: (value: any) => void
}

interface RankTier {
  id: string
  name: string
  image?: string
  lp?: boolean
  divisions: string[]
}

interface Server {
  id: string
  name: string
}

interface BoostOption {
  name: string
  description: string
  priceMultiplier: number
}

export function GameAttributeEditor({ initialValue, onChange }: GameAttributeEditorProps) {
  const [attributes, setAttributes] = useState<any>({
    basePrice: 39.99,
    discountPercentage: 0,
    supportsTeamMode: false,
    rankTiers: [],
    servers: [],
    options: {},
    ...(initialValue || {}),
  })

  const [newRankTier, setNewRankTier] = useState<Partial<RankTier>>({
    id: "",
    name: "",
    image: "",
    lp: true,
    divisions: [],
  })

  const [newDivision, setNewDivision] = useState<string>("")
  const [newServer, setNewServer] = useState<Server>({ id: "", name: "" })
  const [newOptionKey, setNewOptionKey] = useState<string>("")
  const [newOption, setNewOption] = useState<BoostOption>({
    name: "",
    description: "",
    priceMultiplier: 1.0,
  })

  // Use a ref to track if this is the initial render
  const isInitialMount = useRef(true)

  // Use a ref to track the previous initialValue
  const prevInitialValueRef = useRef(initialValue)

  // Update local state when initialValue changes from parent
  useEffect(() => {
    // Only update if initialValue has actually changed
    if (JSON.stringify(prevInitialValueRef.current) !== JSON.stringify(initialValue)) {
      setAttributes({
        basePrice: 39.99,
        discountPercentage: 0,
        supportsTeamMode: false,
        rankTiers: [],
        servers: [],
        options: {},
        ...(initialValue || {}),
      })
      prevInitialValueRef.current = initialValue
    }
  }, [initialValue])

  // Update parent component when attributes change, but not on initial render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Use a timeout to prevent too many rapid updates
    const timeoutId = setTimeout(() => {
      onChange(attributes)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [attributes, onChange])

  // Handle basic attribute changes
  const handleBasicChange = (field: string, value: any) => {
    setAttributes((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Add a new rank tier
  const addRankTier = () => {
    if (!newRankTier.id || !newRankTier.name) return

    setAttributes((prev: any) => ({
      ...prev,
      rankTiers: [
        ...(prev.rankTiers || []),
        {
          id: newRankTier.id,
          name: newRankTier.name,
          image: newRankTier.image || "",
          lp: newRankTier.lp || false,
          divisions: [],
        },
      ],
    }))

    setNewRankTier({
      id: "",
      name: "",
      image: "",
      lp: true,
      divisions: [],
    })
  }

  // Remove a rank tier
  const removeRankTier = (id: string) => {
    setAttributes((prev: any) => ({
      ...prev,
      rankTiers: (prev.rankTiers || []).filter((tier: RankTier) => tier.id !== id),
    }))
  }

  // Add a division to a rank tier
  const addDivisionToRankTier = (rankTierId: string) => {
    if (!newDivision) return

    setAttributes((prev: any) => {
      const updatedRankTiers = (prev.rankTiers || []).map((tier: RankTier) => {
        if (tier.id === rankTierId) {
          return {
            ...tier,
            divisions: [...(tier.divisions || []), newDivision],
          }
        }
        return tier
      })

      return {
        ...prev,
        rankTiers: updatedRankTiers,
      }
    })

    setNewDivision("")
  }

  // Remove a division from a rank tier
  const removeDivisionFromRankTier = (rankTierId: string, division: string) => {
    setAttributes((prev: any) => {
      const updatedRankTiers = (prev.rankTiers || []).map((tier: RankTier) => {
        if (tier.id === rankTierId) {
          return {
            ...tier,
            divisions: (tier.divisions || []).filter((div: string) => div !== division),
          }
        }
        return tier
      })

      return {
        ...prev,
        rankTiers: updatedRankTiers,
      }
    })
  }

  // Toggle LP for a rank tier
  const toggleLpForRankTier = (rankTierId: string) => {
    setAttributes((prev: any) => {
      const updatedRankTiers = (prev.rankTiers || []).map((tier: RankTier) => {
        if (tier.id === rankTierId) {
          return {
            ...tier,
            lp: !tier.lp,
          }
        }
        return tier
      })

      return {
        ...prev,
        rankTiers: updatedRankTiers,
      }
    })
  }

  // Add a new server
  const addServer = () => {
    if (!newServer.id || !newServer.name) return

    setAttributes((prev: any) => ({
      ...prev,
      servers: [...(prev.servers || []), { ...newServer }],
    }))

    setNewServer({ id: "", name: "" })
  }

  // Remove a server
  const removeServer = (id: string) => {
    setAttributes((prev: any) => ({
      ...prev,
      servers: (prev.servers || []).filter((server: Server) => server.id !== id),
    }))
  }

  // Add a new boost option
  const addOption = () => {
    if (!newOptionKey || !newOption.name) return

    setAttributes((prev: any) => ({
      ...prev,
      options: {
        ...(prev.options || {}),
        [newOptionKey]: { ...newOption },
      },
    }))

    setNewOptionKey("")
    setNewOption({
      name: "",
      description: "",
      priceMultiplier: 1.0,
    })
  }

  // Remove a boost option
  const removeOption = (key: string) => {
    setAttributes((prev: any) => {
      const updatedOptions = { ...(prev.options || {}) }
      delete updatedOptions[key]

      return {
        ...prev,
        options: updatedOptions,
      }
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="ranks">Rank Tiers</TabsTrigger>
          <TabsTrigger value="options">Boost Options</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={attributes.basePrice || ""}
                    onChange={(e) => handleBasicChange("basePrice", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={attributes.discountPercentage || ""}
                    onChange={(e) => handleBasicChange("discountPercentage", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

            
              <div className="space-y-2">
                <Label>Servers</Label>
                {attributes.servers?.length > 0 ? (
                  <div className="space-y-2">
                    {attributes.servers.map((server: Server) => (
                      <div key={server.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{server.name}</span>
                          <span className="text-xs text-muted-foreground">({server.id})</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeServer(server.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No servers added yet.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="newServerId">Server ID</Label>
                    <Input
                      id="newServerId"
                      placeholder="na"
                      value={newServer.id}
                      onChange={(e) => setNewServer({ ...newServer, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newServerName">Server Name</Label>
                    <Input
                      id="newServerName"
                      placeholder="North America"
                      value={newServer.name}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={addServer}
                  disabled={!newServer.id || !newServer.name}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Server
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranks" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rank Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attributes.rankTiers?.length > 0 ? (
                <div className="space-y-2">
                  {attributes.rankTiers.map((tier: RankTier) => (
                    <Collapsible key={tier.id} className="border rounded-md overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center space-x-2">
                          {tier.image && (
                            <ImageIcon
                              src={tier.image || "/placeholder.svg"}
                              alt={tier.name}
                              className="h-6 w-6 object-contain"
                            />
                          )}
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-xs text-muted-foreground">({tier.id})</span>
                          {tier.divisions?.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {tier.divisions.length} divisions
                            </Badge>
                          )}
                          <Badge variant={tier.lp ? "default" : "outline"} className="ml-1">
                            LP {tier.lp ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Toggle divisions</span>
                            </Button>
                          </CollapsibleTrigger>
                          <Button variant="ghost" size="sm" onClick={() => removeRankTier(tier.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Remove rank tier</span>
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="p-3 border-t bg-background">
                         

                          <div className="space-y-2 mb-3">
                            <Label htmlFor={`image-${tier.id}`}>Image URL</Label>
                            <Input
                              id={`image-${tier.id}`}
                              value={tier.image || ""}
                              onChange={(e) => {
                                setAttributes((prev: any) => {
                                  const updatedRankTiers = (prev.rankTiers || []).map((t: RankTier) => {
                                    if (t.id === tier.id) {
                                      return {
                                        ...t,
                                        image: e.target.value,
                                      }
                                    }
                                    return t
                                  })
                                  return {
                                    ...prev,
                                    rankTiers: updatedRankTiers,
                                  }
                                })
                              }}
                              placeholder="https://example.com/image.png"
                            />
                          </div>

                          <h4 className="text-sm font-medium mb-2">Divisions</h4>

                          {/* List of divisions for this rank tier */}
                          {tier.divisions?.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {tier.divisions.map((division: string) => (
                                <div key={division} className="flex items-center space-x-2 p-2 border rounded-md">
                                  <span className="font-medium">{division}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDivisionFromRankTier(tier.id, division)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mb-3">No divisions added yet.</p>
                          )}

                          {/* Add division form */}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label htmlFor={`newDivision-${tier.id}`} className="sr-only">
                                Division
                              </Label>
                              <Input
                                id={`newDivision-${tier.id}`}
                                placeholder="IV"
                                value={newDivision}
                                onChange={(e) => setNewDivision(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => addDivisionToRankTier(tier.id)}
                              disabled={!newDivision}
                              className="h-9"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No rank tiers added yet.</p>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add New Rank Tier</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newRankId">ID</Label>
                      <Input
                        id="newRankId"
                        placeholder="bronze"
                        value={newRankTier.id}
                        onChange={(e) => setNewRankTier({ ...newRankTier, id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newRankName">Name</Label>
                      <Input
                        id="newRankName"
                        placeholder="Bronze"
                        value={newRankTier.name}
                        onChange={(e) => setNewRankTier({ ...newRankTier, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newRankImage">Image URL</Label>
                    <Input
                      id="newRankImage"
                      placeholder="https://example.com/image.png"
                      value={newRankTier.image}
                      onChange={(e) => setNewRankTier({ ...newRankTier, image: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="newRankLp"
                      checked={newRankTier.lp || false}
                      onCheckedChange={(checked) => setNewRankTier({ ...newRankTier, lp: checked })}
                    />
                    <Label htmlFor="newRankLp">Supports LP</Label>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={addRankTier}
                    disabled={!newRankTier.id || !newRankTier.name}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Rank Tier
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Boost Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(attributes.options || {}).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(attributes.options || {}).map(([key, option]: [string, any]) => (
                    <Collapsible key={key} className="border rounded-md overflow-hidden">
                      <div className="flex items-center justify-between p-3 bg-muted/30">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{option.name}</span>
                          <span className="text-xs text-muted-foreground">({key})</span>
                          <Badge variant="outline" className="ml-2">
                            {option.priceMultiplier}x
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Toggle details</span>
                            </Button>
                          </CollapsibleTrigger>
                          <Button variant="ghost" size="sm" onClick={() => removeOption(key)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Remove option</span>
                          </Button>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="p-3 border-t bg-background">
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <p className="text-sm">{option.description}</p>
                          </div>
                          <div className="space-y-2 mt-3">
                            <Label htmlFor={`priceMultiplier-${key}`}>Price Multiplier</Label>
                            <Input
                              id={`priceMultiplier-${key}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={option.priceMultiplier}
                              onChange={(e) => {
                                setAttributes((prev: any) => {
                                  const updatedOptions = { ...(prev.options || {}) }
                                  updatedOptions[key] = {
                                    ...updatedOptions[key],
                                    priceMultiplier: Number.parseFloat(e.target.value) || 0,
                                  }
                                  return {
                                    ...prev,
                                    options: updatedOptions,
                                  }
                                })
                              }}
                            />
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No boost options added yet.</p>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Add New Boost Option</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newOptionKey">Option Key</Label>
                    <Input
                      id="newOptionKey"
                      placeholder="priority"
                      value={newOptionKey}
                      onChange={(e) => setNewOptionKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      A unique identifier for this option (e.g., "priority", "soloOnly")
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newOptionName">Display Name</Label>
                    <Input
                      id="newOptionName"
                      placeholder="Priority Boost"
                      value={newOption.name}
                      onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newOptionDescription">Description</Label>
                    <Textarea
                      id="newOptionDescription"
                      placeholder="Your order will be completed with priority"
                      value={newOption.description}
                      onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newOptionPriceMultiplier">Price Multiplier</Label>
                    <Input
                      id="newOptionPriceMultiplier"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newOption.priceMultiplier}
                      onChange={(e) =>
                        setNewOption({
                          ...newOption,
                          priceMultiplier: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      How much this option affects the price (e.g., 1.25 = 25% increase)
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={addOption}
                    disabled={!newOptionKey || !newOption.name}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Boost Option
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
