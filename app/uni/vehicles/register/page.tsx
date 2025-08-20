"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, FileText, Bus, AlertCircle, CheckCircle, User } from "lucide-react"
import Link from "next/link"
import useVehicles from "@/hooks/useVehicles"

export default function RegisterVehiclePage() {
  const {
    user,
    formData,
    loading,
    error,
    success,
    vehicleMakes,
    routes,
    driversLicensesRef,
    vehicleRegistrationCertificateRef, 
    insuranceCertificatesRef,
    operator,
    setOperator,
    handleSubmit,
    handleInputChange 
  } = useVehicles();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/client/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Register Vehicle</h1>
              <p className="text-sm text-gray-600">Register a new commuter omnibus vehicle</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vehicle Information */}
          {
            user &&
            user.user.role === "admin" &&
            <Card>
              <CardContent className="mt-4">
                <div className="relative">
                    <Label>Company Name *</Label>
                    <Input
                      id="operator"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      placeholder="e.g Raincheck Logistics"
                      required
                    />
                    <div className="flex-1 flex flex-row bg-white absolute p-3 w-full border border-gray-300 top-[70px] rounded shadow-sm"></div>
                </div>
                </CardContent>
            </Card>
          }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bus className="h-5 w-5" />
                <span>Vehicle Information</span>
              </CardTitle>
              <CardDescription>Basic information about the vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    placeholder="e.g., AEZ 1234"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Passenger Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    placeholder="e.g., 14"
                    min="10"
                    max="30"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Select onValueChange={(value) => handleInputChange("make", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleMakes.map((make) => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="e.g., Hiace"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    placeholder="e.g., 2020"
                    min="2000"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engineNumber">Engine Number *</Label>
                  <Input
                    id="engineNumber"
                    value={formData.engineNumber}
                    onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                    placeholder="Enter engine number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="chassisNumber">Chassis Number *</Label>
                  <Input
                    id="chassisNumber"
                    value={formData.chassisNumber}
                    onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                    placeholder="Enter chassis number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    placeholder="e.g., White"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Insurance & Documentation</CardTitle>
              <CardDescription>Insurance and legal documentation details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                    placeholder="e.g., Old Mutual Insurance"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePolicyNumber">Policy Number *</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
                    placeholder="Enter policy number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceExpiryDate">Insurance Expiry Date *</Label>
                  <Input
                    id="insuranceExpiryDate"
                    type="date"
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => handleInputChange("insuranceExpiryDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roadworthyExpiryDate">Roadworthy Certificate Expiry *</Label>
                  <Input
                    id="roadworthyExpiryDate"
                    type="date"
                    value={formData.roadworthyExpiryDate}
                    onChange={(e) => handleInputChange("roadworthyExpiryDate", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Information</CardTitle>
              <CardDescription>Route and driver information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="operatingRoute">Intended Operating Route *</Label>
                <Select onValueChange={(value) => handleInputChange("operatingRoute", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driverName">Primary Driver Name *</Label>
                  <Input
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => handleInputChange("driverName", e.target.value)}
                    placeholder="Enter driver's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="driverLicenseNumber">Driver's License Number *</Label>
                  <Input
                    id="driverLicenseNumber"
                    value={formData.driverLicenseNumber}
                    onChange={(e) => handleInputChange("driverLicenseNumber", e.target.value)}
                    placeholder="Enter license number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="driverLicenseExpiry">Driver's License Expiry Date *</Label>
                <Input
                  id="driverLicenseExpiry"
                  type="date"
                  value={formData.driverLicenseExpiry}
                  onChange={(e) => handleInputChange("driverLicenseExpiry", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <div>
            <input
              type="file"
              hidden
              ref={vehicleRegistrationCertificateRef}
              onChange={(e) =>
                handleInputChange("vehicleDocuments", e.target.files?.[0] || null)
              }
            />
            <input
              type="file"
              hidden
              ref={driversLicensesRef}
              onChange={(e) =>
                handleInputChange("driversLicenses", e.target.files?.[0] || null)
              }
            />
            <input
              type="file"
              hidden
              ref={insuranceCertificatesRef}
              onChange={(e) =>
                handleInputChange("insuranceCertificates", e.target.files?.[0] || null)
              }
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload the necessary documents for vehicle registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Vehicle Registration Certificate</p>
                  <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm" 
                    onClick={()=> vehicleRegistrationCertificateRef.current?.click()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Insurance Certificate</p>
                  <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={()=> insuranceCertificatesRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Driver's License</p>
                  <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                  <Button 
                    variant="outline"
                    type="button"
                    size="sm"
                    onClick={()=> driversLicensesRef.current?.click()}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Link href="/client/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? "Registering..." : "Register Vehicle"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
