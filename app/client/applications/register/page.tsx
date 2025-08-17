
"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import useApplication from "@/hooks/useApplications"
export default function NewApplicationPage() {
  const {    
    formData,
    isLoading,
    status,
    businessRegistrationCertificateRef,
    insuranceCertificatesRef,
    driversLicensesRef,
    vehicleDocumentRef,
    routes,
    handleInputChange,
    handleSubmit,
  } = useApplication();
 
  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-xl font-bold text-gray-900">New Permit Application</h1>
              <p className="text-sm text-gray-600">Apply for a commuter omnibus operating permit</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Operator Information</CardTitle>
              <CardDescription>Basic information about the transport operator</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operatorName">Company/Operator Name *</Label>
                  <Input
                    id="operatorName"
                    value={formData.operatorName}
                    onChange={(e) => handleInputChange("operatorName", e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter complete business address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessRegistration">Business Registration Number</Label>
                <Input
                  id="businessRegistration"
                  value={formData.businessRegistration}
                  onChange={(e) => handleInputChange("businessRegistration", e.target.value)}
                  placeholder="Enter business registration number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
              <CardDescription>Details about the proposed transport route</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routeFrom">Route From *</Label>
                  <Select onValueChange={(value) => handleInputChange("routeFrom", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select starting point" />
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
                <div>
                  <Label htmlFor="routeTo">Route To *</Label>
                  <Select onValueChange={(value) => handleInputChange("routeTo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleCount">Number of Vehicles *</Label>
                  <Input
                    id="vehicleCount"
                    type="number"
                    value={formData.vehicleCount}
                    onChange={(e) => handleInputChange("vehicleCount", e.target.value)}
                    placeholder="Enter number of vehicles"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="operatingHours">Operating Hours *</Label>
                  <Input
                    id="operatingHours"
                    value={formData.operatingHours}
                    onChange={(e) => handleInputChange("operatingHours", e.target.value)}
                    placeholder="e.g., 05:00 - 22:00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Route Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide additional details about the route, stops, or special considerations"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload the necessary documents for your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden inputs */}
              <input
                type="file"
                hidden
                ref={businessRegistrationCertificateRef}
                onChange={(e) =>
                  handleInputChange("businessRegistrationCertificate", e.target.files?.[0] || null)
                }
              />
              <input
                type="file"
                hidden
                ref={vehicleDocumentRef}
                onChange={(e) =>
                  handleInputChange("vehicleDocuments", e.target.files?.[0] || null)
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
              <input
                type="file"
                hidden
                ref={driversLicensesRef}
                onChange={(e) =>
                  handleInputChange("driversLicenses", e.target.files?.[0] || null)
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Registration Certificate */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Business Registration Certificate</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => businessRegistrationCertificateRef.current?.click()}
                    type="button"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Upload File
                  </Button>
                </div>

                {/* Vehicle Documents */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Vehicle Registration Documents</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => vehicleDocumentRef.current?.click()}
                    type="button"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Upload Files
                  </Button>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Insurance Certificates</p>
                  <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                  <Button variant="outline" size="sm"
                    type="button"
                    onClick={() => insuranceCertificatesRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Driver's Licenses</p>
                  <p className="text-xs text-gray-500 mb-2">PDF, JPG, PNG (Max 5MB)</p>
                  <Button variant="outline" size="sm"
                    type="button"
                    onClick={() => driversLicensesRef.current?.click()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {
            status.success &&
              <Alert className="border-green-200 bg-green-50" >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your application has been successfully created!
                </AlertDescription>
              </Alert>
          }
          {
            status.error && 
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Something went wrong. Please try again later.
                </AlertDescription>
              </Alert>
          }
          <div className="flex justify-end space-x-4">
            <Link href="/client/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="px-8">
              Submit Application
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}



