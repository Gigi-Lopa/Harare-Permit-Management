"use client"
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
  User,
  Phone,
  Clock,
} from "lucide-react"
import { AddViolationDialog } from "@/components/general/AddViolation"
import useOfficer from "@/hooks/useOfficer"

export default function OfficerDashboardPage() {
  const { user,
        searchPlate,
        vehicleInfo,
        loading,
        error,
        searchHistory,
        setError,
        handleSearch,
        AddViolation,
        handleLogout,
        setSearchPlate} = useOfficer();

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
                  Officer {user.user.firstName} {user.user.lastName}
                </p>
                <p className="text-xs text-gray-600">Badge: {user.user.badgeNumber}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-700">
                  {user.user.firstName ? `${user.user.firstName[0]}${user.user.lastName?.[0] || ""}` : "O"}
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
                  <div>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="flex items-center justify-center mt-5">
                      <AddViolationDialog
                        user = {user}
                        vehicleId={"UNKNOWN"}
                        onViolationAdded={(v:any, isUnknown: boolean) => {
                          if (isUnknown) {
                            alert("Violation successfully ended")
                            return setError("")
                          };
                          AddViolation(v)
                        }}
                      />
                    </div>
                  </div>
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
                    <div>
                        <div className="text-center py-8">
                          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Not Found</h3>
                          <p className="text-gray-600">No vehicle found with license plate {vehicleInfo.licensePlate}</p>
                        </div>
                    </div>
                    
                  ) : (
                    <div className="space-y-6">
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
                       <AddViolationDialog
                          user = {user}
                          vehicleId={vehicleInfo.vehicleID}
                          onViolationAdded={(v) => {
                            AddViolation(v)
                          }}
                        />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

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
