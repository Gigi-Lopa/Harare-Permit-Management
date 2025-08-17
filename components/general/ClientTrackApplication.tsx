"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, SearchIcon, XCircle, } from "lucide-react"
import { Application } from "@/types"
import App from "next/app"


interface props{
    getStatusIcon : (value:string) => React.ReactNode,
    getStatusBadge  : (value: string) => React.ReactNode,
    applicationId : string,
    applicationData : Application | null,
    loading : false | true,
    applications : Application[] | null,
    setApplicationId : (value:string) => void,
    onClear : ()=> void,
    handleSearch : (value : "default" | "single") => void
}

export default function TrackApplication({getStatusBadge ,onClear, applications,applicationData, applicationId, setApplicationId, handleSearch, loading}:props) {

    const [showSearchResults, setShowSearchResults] =  useState(false)
   
  return (
    <div className="w-full">
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Enter Application ID</CardTitle>
                <CardDescription>Enter your application ID to track the status of your permit application</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-4 relative">
                    <div className="flex-1 flex flex-row gap-2">
                        <Input
                            placeholder="e.g., PRM-2024-001"
                            value={applicationId}
                            onBlur={()=> setShowSearchResults(false)}
                            onChange={(e) => {
                                setApplicationId(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch("default");
                                    setShowSearchResults(true)
                                }
                            }}
                        />
                    <Button onClick={()=>handleSearch("default")}> <SearchIcon className="w-4 h-4 mr-1" /> Search</Button>
                    <Button onClick={onClear} variant={"destructive"}> <XCircle className="w-4 h-4 mr-1" /> Clear</Button>
                    {
                        applications != null && showSearchResults &&
                   <div className="absolute w-full top-[45px] z-50 bg-white border border-gray-200 rounded shadow-sm">
                            {
                                applications.length === 0 ? 
                                <div className="w-full text-center p-4">No Results</div>
                                    :
                                    applications.map((app, index) =>
                                        <Button
                                            variant="ghost"
                                            key={index}
                                            className="w-full"
                                            onMouseDown={() => {
                                                setApplicationId(app.applicationId);
                                                handleSearch("single");
                                                setShowSearchResults(false);
                                            }}
                                        >
                                        {app.applicationId}
                                </Button>
                            )
                            }
                        </div>
                    }
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
