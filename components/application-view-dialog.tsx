"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, FileText, User, MapPin, Car } from "lucide-react"

interface ApplicationViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: any
}

export function ApplicationViewDialog({ open, onOpenChange, application }: ApplicationViewDialogProps) {
  if (!application) return null

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      under_review: "outline",
      rejected: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace("_", " ")}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Application Details</span>
            {getStatusBadge(application.status)}
          </DialogTitle>
          <DialogDescription>Application ID: {application.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Overview */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600">Application ID</Label>
              <p className="text-lg font-mono">{application.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Submitted Date</Label>
              <p className="text-lg">{application.submittedDate}</p>
            </div>
          </div>

          <Separator />

          {/* Operator Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Operator Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                <p className="text-lg">{application.operatorName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Contact Person</Label>
                <p className="text-lg">{application.contactPerson}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-lg">john@cityexpress.co.zw</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-lg">+263 77 123 4567</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Business Registration</Label>
                <p className="text-lg">BR-2020-001</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Business Address</Label>
                <p className="text-lg">123 Samora Machel Avenue, Harare</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Route Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Route Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Route</Label>
                <p className="text-lg">{application.route}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Distance</Label>
                <p className="text-lg">25.5 km</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Estimated Time</Label>
                <p className="text-lg">45 minutes</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Proposed Fare</Label>
                <p className="text-lg">$2.50</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Number of Vehicles</Label>
                <p className="text-lg">{application.vehicleCount}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Vehicle Types</Label>
                <p className="text-lg">Toyota Hiace, Nissan Caravan</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Total Capacity</Label>
                <p className="text-lg">{application.vehicleCount * 14} passengers</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Insurance Status</Label>
                <Badge variant="default" className="text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Timeline */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Application Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-600 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-gray-600">{application.submittedDate} at 10:30 AM</p>
                </div>
              </div>

              {application.status !== "pending" && (
                <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="bg-yellow-600 p-2 rounded-full">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Under Review</p>
                    <p className="text-sm text-gray-600">2024-01-16 at 2:15 PM</p>
                  </div>
                </div>
              )}

              {application.status === "approved" && (
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                  <div className="bg-green-600 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Application Approved</p>
                    <p className="text-sm text-gray-600">2024-01-17 at 11:45 AM</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Required Documents
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Business Registration Certificate", status: "verified" },
                { name: "Vehicle Registration Documents", status: "verified" },
                { name: "Insurance Certificates", status: "verified" },
                { name: "Driver's Licenses", status: "pending" },
                { name: "Route Survey Report", status: "verified" },
                { name: "Safety Compliance Certificate", status: "verified" },
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{doc.name}</span>
                  <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Administrative Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Application reviewed and all documents verified. Route survey completed successfully. Operator has good
                compliance history. Recommended for approval.
              </p>
              <p className="text-xs text-gray-500 mt-2">Last updated by Admin Sarah Mutasa on 2024-01-17 at 11:30 AM</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
