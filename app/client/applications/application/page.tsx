"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ApplicationFull } from "@/types"

export default function ApplicationDetailsPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [application, setApplication] = useState<ApplicationFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchApplication = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${id}`)
        const data = await res.json()
        if (res.ok) setApplication(data)
      } catch (err) {
        console.error("Error fetching application:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchApplication()
  }, [id])

  if (loading) return <div className="p-10">Loading...</div>
  if (!application) return <div className="p-10">Application not found.</div>

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
              <h1 className="text-xl font-bold text-gray-900">Application {application.applicationId}</h1>
              <p className="text-sm text-gray-600">Submitted on {application.submittedDate}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
            <CardDescription>Details about the applicant</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="font-medium">Operator Name</p>{application.operatorName}</div>
            <div><p className="font-medium">Contact Person</p>{application.contactPerson}</div>
            <div><p className="font-medium">Email</p>{application.email}</div>
            <div><p className="font-medium">Phone</p>{application.phone}</div>
            <div className="md:col-span-2"><p className="font-medium">Address</p>{application.address}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="font-medium">Route</p>{application.routeFrom} → {application.routeTo}</div>
            <div><p className="font-medium">Vehicles</p>{application.vehicleCount}</div>
            <div><p className="font-medium">Operating Hours</p>{application.operatingHours}</div>
            <div><p className="font-medium">Status</p>{application.status}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(application.uploadedFiles || {}).map(([key, value]) => (
              <div key={key}>
                <p className="font-medium capitalize">{key}</p>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/files/download?path=${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Document
                </a>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-3 h-3 mt-1 rounded-full ${event.completed ? "bg-green-500" : "bg-gray-300"}`} />
                <div>
                  <p className="font-medium">{event.status}</p>
                  <p className="text-sm text-gray-600">{event.date} {event.time}</p>
                  <p className="text-sm">{event.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
