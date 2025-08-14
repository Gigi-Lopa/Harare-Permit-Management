"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Search,
  Car,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  FileText,
  Calendar,
  User,
  Phone,
  MapPin,
  Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function OfficerDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [searchPlate, setSearchPlate] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchHistory, setSearchHistory] = useState([])
  const router = useRouter()

  useEffect(() => {
  /*   // Check if user is logged in and is officer
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/officer-login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "officer") {
      router.push("/auth/officer")
      return
    } */

    setUser({
      badgeNumber : "5555",
      firstName : "Gilbert",
      lastName : "Lopah"
    })
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    // Mock search history
    setSearchHistory([
      {
        id: 1,
        licensePlate: "AEZ 1234",
        searchTime: "2024-01-20 14:30",
        status: "valid",
        operatorName: "City Express Transport",
      },
      {
        id: 2,
        licensePlate: "AEZ 5678",
        searchTime: "2024-01-20 13:15",
        status: "expired",
        operatorName: "Harare Commuter Services",
      },
      {
        id: 3,
        licensePlate: "AEZ 9999",
        searchTime: "2024-01-20 12:45",
        status: "invalid",
        operatorName: "Unknown",
      },
    ])
  }

  const handleSearch = async () => {
    if (!searchPlate.trim()) {
      setError("Please enter a license plate number")
      return
    }

    setLoading(true)
    setError("")
    setVehicleInfo(null)

    try {
      // Mock API call - in real app, this would call Flask backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock vehicle data based on license plate
      const mockVehicleData = {
        "AEZ 1234": {
          licensePlate: "AEZ 1234",
          status: "valid",
          operatorName: "City Express Transport",
          contactPerson: "John Mukamuri",
          phone: "+263 77 123 4567",
          vehicleModel: "Toyota Hiace",
          capacity: 14,
          route: "CBD - Chitungwiza",
          permitNumber: "PRM-2024-001",
          permitExpiry: "2024-12-31",
          lastInspection: "2024-01-01",
          insuranceExpiry: "2024-06-30",
          roadworthyExpiry: "2024-08-15",
          violations: [
            {
              id: 1,
              date: "2024-01-15",
              violation: "Overloading",
              fine: "$50",
              status: "paid",
            },
          ],
        },
        "AEZ 5678": {
          licensePlate: "AEZ 5678",
          status: "expired",
          operatorName: "Harare Commuter Services",
          contactPerson: "Mary Chikwanha",
          phone: "+263 77 234 5678",
          vehicleModel: "Nissan Caravan",
          capacity: 16,
          route: "CBD - Mbare",
          permitNumber: "PRM-2024-002",
          permitExpiry: "2024-01-15",
          lastInspection: "2023-12-15",
          insuranceExpiry: "2024-03-30",
          roadworthyExpiry: "2024-02-15",
          violations: [],
        },
        "AEZ 9999": {
          licensePlate: "AEZ 9999",
          status: "invalid",
          operatorName: "Unknown",
          contactPerson: "N/A",
          phone: "N/A",
          vehicleModel: "Unknown",
          capacity: 0,
          route: "N/A",
          permitNumber: "N/A",
          permitExpiry: "N/A",
          lastInspection: "N/A",
          insuranceExpiry: "N/A",
          roadworthyExpiry: "N/A",
          violations: [],
        },
      }

      const vehicleData = mockVehicleData[searchPlate.toUpperCase()] || {
        licensePlate: searchPlate.toUpperCase(),
        status: "not_found",
        operatorName: "Not Found",
        contactPerson: "N/A",
        phone: "N/A",
        vehicleModel: "N/A",
        capacity: 0,
        route: "N/A",
        permitNumber: "N/A",
        permitExpiry: "N/A",
        lastInspection: "N/A",
        insuranceExpiry: "N/A",
        roadworthyExpiry: "N/A",
        violations: [],
      }

      setVehicleInfo(vehicleData)

      // Add to search history
      const newSearch = {
        id: Date.now(),
        licensePlate: searchPlate.toUpperCase(),
        searchTime: new Date().toLocaleString(),
        status: vehicleData.status,
        operatorName: vehicleData.operatorName,
      }
      setSearchHistory((prev) => [newSearch, ...prev.slice(0, 9)])
    } catch (err) {
      setError("Failed to search vehicle information")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth/officer-login")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      valid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      expired: { variant: "secondary" as const, icon: AlertTriangle, color: "text-orange-600" },
      invalid: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      not_found: { variant: "outline" as const, icon: XCircle, color: "text-gray-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_found
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{status.replace("_", " ")}</span>
      </Badge>
    )
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Officer Dashboard</h1>
                <p className="text-sm text-gray-600">Traffic Enforcement Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Officer {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-600">Badge: {user.badgeNumber}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-700">
                  {user.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "O"}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Vehicle License Plate Search</span>
                </CardTitle>
                <CardDescription>Enter a license plate number to get vehicle and permit information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="licensePlate">License Plate Number</Label>
                    <Input
                      id="licensePlate"
                      value={searchPlate}
                      onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                      placeholder="e.g., AEZ 1234"
                      className="font-mono text-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} disabled={loading} className="bg-green-600 hover:bg-green-700">
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            {vehicleInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>Vehicle Information</span>
                    </div>
                    {getStatusBadge(vehicleInfo.status)}
                  </CardTitle>
                  <CardDescription>License Plate: {vehicleInfo.licensePlate}</CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicleInfo.status === "not_found" ? (
                    <div className="text-center py-8">
                      <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Not Found</h3>
                      <p className="text-gray-600">No vehicle found with license plate {vehicleInfo.licensePlate}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-600">Vehicle Model</Label>
                            <p className="text-sm font-medium">{vehicleInfo.vehicleModel}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Capacity</Label>
                            <p className="text-sm font-medium">{vehicleInfo.capacity} passengers</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Route</Label>
                            <p className="text-sm font-medium">{vehicleInfo.route}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Permit Number</Label>
                            <p className="text-sm font-medium">{vehicleInfo.permitNumber}</p>
                          </div>
                        </div>
                      </div>

                      {/* Operator Information */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Operator Information</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{vehicleInfo.operatorName}</p>
                              <p className="text-xs text-gray-600">Contact: {vehicleInfo.contactPerson}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{vehicleInfo.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Permit & Compliance Status */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Permit & Compliance Status</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-600">Permit Expiry</Label>
                            <p
                              className={`text-sm font-medium ${
                                new Date(vehicleInfo.permitExpiry) < new Date() ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {vehicleInfo.permitExpiry}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Last Inspection</Label>
                            <p className="text-sm font-medium">{vehicleInfo.lastInspection}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Insurance Expiry</Label>
                            <p
                              className={`text-sm font-medium ${
                                new Date(vehicleInfo.insuranceExpiry) < new Date() ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {vehicleInfo.insuranceExpiry}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Roadworthy Expiry</Label>
                            <p
                              className={`text-sm font-medium ${
                                new Date(vehicleInfo.roadworthyExpiry) < new Date() ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {vehicleInfo.roadworthyExpiry}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Violations History */}
                      {vehicleInfo.violations && vehicleInfo.violations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Violations</h4>
                          <div className="space-y-2">
                            {vehicleInfo.violations.map((violation: any) => (
                              <div
                                key={violation.id}
                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium text-red-900">{violation.violation}</p>
                                  <p className="text-xs text-red-600">{violation.date}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{violation.fine}</p>
                                  <Badge
                                    variant={violation.status === "paid" ? "default" : "destructive"}
                                    className="text-xs"
                                  >
                                    {violation.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Searches</span>
                </CardTitle>
                <CardDescription>Your recent license plate searches</CardDescription>
              </CardHeader>
              <CardContent>
                {searchHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No searches yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchHistory.slice(0, 10).map((search: any) => (
                      <div key={search.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium font-mono">{search.licensePlate}</p>
                          <p className="text-xs text-gray-600">{search.searchTime}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(search.status)}
                          <p className="text-xs text-gray-600 mt-1">{search.operatorName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
