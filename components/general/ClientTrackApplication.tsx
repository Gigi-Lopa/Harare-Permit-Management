"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, XCircle, } from "lucide-react"


interface props{
    getStatusIcon : (value:string) => React.ReactNode,
    getStatusBadge  : (value: string) => React.ReactNode
}

export default function TrackApplication({getStatusBadge, getStatusIcon}:props) {
  const [applicationId, setApplicationId] = useState("")
  const [applicationData, setApplicationData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const mockApplication = {
    id: "PRM-2024-001",
    operatorName: "City Express Transport",
    contactPerson: "John Mukamuri",
    route: "CBD - Chitungwiza",
    status: "under_review",
    submittedDate: "2024-01-15",
    vehicleCount: 5,
    timeline: [
      {
        status: "submitted",
        date: "2024-01-15",
        time: "09:30 AM",
        description: "Application submitted successfully",
        completed: true,
      },
      {
        status: "document_verification",
        date: "2024-01-16",
        time: "02:15 PM",
        description: "Documents under verification",
        completed: true,
      },
      {
        status: "technical_review",
        date: "2024-01-18",
        time: "10:00 AM",
        description: "Technical review in progress",
        completed: false,
        current: true,
      },
      {
        status: "approval",
        date: "",
        time: "",
        description: "Final approval pending",
        completed: false,
      },
    ],
  }

  const handleSearch = async () => {
    if (!applicationId.trim()) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (applicationId === "PRM-2024-001") {
        setApplicationData(mockApplication)
      } else {
        setApplicationData(null)
      }
      setLoading(false)
    }, 1000)
  }


  return (
    <div className="w-full">
        <Card className="mb-8">
        <CardHeader>
            <CardTitle>Enter Application ID</CardTitle>
            <CardDescription>Enter your application ID to track the status of your permit application</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex space-x-4">
            <div className="flex-1">
                <Input
                placeholder="e.g., PRM-2024-001"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Track"}
            </Button>
            </div>
        </CardContent>
        </Card>

        {/* Application Details */}
        {applicationData && (
        <div className="space-y-6 mb-10">
            <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Application ID: {applicationData.id}</CardDescription>
                </div>
                {getStatusBadge(applicationData.status)}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-600">Operator Name</p>
                    <p className="text-lg">{applicationData.operatorName}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Contact Person</p>
                    <p className="text-lg">{applicationData.contactPerson}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Route</p>
                    <p className="text-lg">{applicationData.route}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">Submitted Date</p>
                    <p className="text-lg">{applicationData.submittedDate}</p>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>
        )}

        {/* No Results */}
        {applicationData === null && applicationId && !loading && (
        <Card>
            <CardContent className="pt-6">
            <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
                <p className="text-gray-600 mb-4">
                We couldn't find an application with ID "{applicationId}". Please check the ID and try again.
                </p>
                <Button variant="outline" onClick={() => setApplicationId("")}>
                Try Again
                </Button>
            </div>
            </CardContent>
        </Card>
        )}
    </div>
  )
}
