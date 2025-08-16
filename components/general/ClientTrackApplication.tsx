"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, XCircle, } from "lucide-react"
import { Application } from "@/types"


interface props{
    getStatusIcon : (value:string) => React.ReactNode,
    getStatusBadge  : (value: string) => React.ReactNode,
    applicationId : string,
    applicationData : Application | null,
    loading : false | true,
    setApplicationId : (value:string) => void,
    handleSearch : (value : "default" | "single") => void
}

export default function TrackApplication({getStatusBadge , applicationData, applicationId, setApplicationId, handleSearch, loading}:props) {

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
                  onChange={(e) => {
                    setApplicationId(e.target.value)
                    handleSearch("default")
                }}
            />
            </div>
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
                    <CardDescription>Application ID: {applicationData.applicationId}</CardDescription>
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

    </div>
  )
}
