"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, MapPin, Clock, DollarSign, Bus, Filter } from "lucide-react"
import Link from "next/link"

export default function RoutesPage() {
  const [routes, setRoutes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      // Mock data - in real app, fetch from Flask API
      const mockRoutes = [
        {
          routeId: "RT-001",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Chitungwiza",
          distance: 25.5,
          estimatedTime: 45,
          fare: 2.5,
          status: "active",
          operatingVehicles: 12,
          dailyTrips: 48,
          description: "Main route connecting CBD to Chitungwiza with stops at major intersections",
        },
        {
          routeId: "RT-002",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Mbare",
          distance: 8.2,
          estimatedTime: 20,
          fare: 1.5,
          status: "active",
          operatingVehicles: 18,
          dailyTrips: 72,
          description: "High-frequency route to Mbare with express and regular services",
        },
        {
          routeId: "RT-003",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Kuwadzana",
          distance: 18.7,
          estimatedTime: 35,
          fare: 2.0,
          status: "active",
          operatingVehicles: 8,
          dailyTrips: 32,
          description: "Regular service to Kuwadzana with intermediate stops",
        },
        {
          routeId: "RT-004",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Budiriro",
          distance: 22.3,
          estimatedTime: 40,
          fare: 2.25,
          status: "active",
          operatingVehicles: 6,
          dailyTrips: 24,
          description: "Service to Budiriro with limited stops for faster travel",
        },
        {
          routeId: "RT-005",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Glen View",
          distance: 15.1,
          estimatedTime: 30,
          fare: 1.75,
          status: "active",
          operatingVehicles: 10,
          dailyTrips: 40,
          description: "Regular service to Glen View with multiple pickup points",
        },
        {
          routeId: "RT-006",
          fromLocation: "CBD (Central Business District)",
          toLocation: "Highfield",
          distance: 12.8,
          estimatedTime: 25,
          fare: 1.5,
          status: "maintenance",
          operatingVehicles: 0,
          dailyTrips: 0,
          description: "Route temporarily suspended for road maintenance",
        },
      ]

      setRoutes(mockRoutes)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching routes:", error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      maintenance: "secondary",
      suspended: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  const filteredRoutes = routes.filter((route: any) => {
    const matchesSearch =
      route.routeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.toLocation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || route.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Transport Routes</h1>
              <p className="text-sm text-gray-600">Available commuter omnibus routes in Harare</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes.filter((route: any) => route.status === "active").length}
                  </p>
                </div>
                <Bus className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Operating Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes.reduce((total: number, route: any) => total + route.operatingVehicles, 0)}
                  </p>
                </div>
                <Bus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Trips</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {routes.reduce((total: number, route: any) => total + route.dailyTrips, 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search routes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Routes</CardTitle>
            <CardDescription>
              Showing {filteredRoutes.length} of {routes.length} routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>From - To</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>Fare (USD)</TableHead>
                  <TableHead>Vehicles</TableHead>
                  <TableHead>Daily Trips</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route: any) => (
                  <TableRow key={route.routeId}>
                    <TableCell className="font-medium">{route.routeId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.fromLocation}</p>
                        <p className="text-sm text-gray-600">to {route.toLocation}</p>
                      </div>
                    </TableCell>
                    <TableCell>{route.distance} km</TableCell>
                    <TableCell>{route.estimatedTime} min</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        {route.fare.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>{route.operatingVehicles}</TableCell>
                    <TableCell>{route.dailyTrips}</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Route Details Cards */}
        <div className="mt-8 grid gap-6">
          {filteredRoutes.slice(0, 3).map((route: any) => (
            <Card key={route.routeId}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{route.routeId}</h3>
                      {getStatusBadge(route.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{route.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Distance</p>
                        <p className="font-medium">{route.distance} km</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Est. Time</p>
                        <p className="font-medium">{route.estimatedTime} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fare</p>
                        <p className="font-medium">${route.fare.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Vehicles</p>
                        <p className="font-medium">{route.operatingVehicles}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
