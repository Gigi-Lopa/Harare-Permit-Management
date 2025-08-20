"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Edit, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ApplicationFull, LocalUser } from "@/types"
import useGetUserInfor from "@/hooks/useGetUserInfor"
import { useRouter } from "next/navigation"
import DeleteApplicationDialog from "@/components/general/DeleteApplicationDialog"
import EditApplicationDialog from "@/components/general/EditApplicationDialog"
import useAdmin from "@/hooks/useAdmin"
import { Badge } from "@/components/ui/badge"

export default function ApplicationDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [application, setApplication] = useState<ApplicationFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole ] = useState("")
const {   
        deleteDialog,
        editDialog,
        editFormData,
        setDeleteDialog,
        handleDeleteApplication,
        handleEditApplication,
        handleUpdateApplicationStatus,
        setEditFormData,
        setEditDialog,
        handleSaveEdit,
        } = useAdmin();
    

  useEffect(() => {
    if (!id) return;
    const user = useGetUserInfor();
    if (!user){
      router.replace("/")
    }
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
   
    setRole(user?.user.role ?? "")

  }, [id])

  if (loading) return <div className="p-10">Loading...</div>
  if (!application) return <div className="p-10">Application not found.</div>

  const getStatusIcon = (status: string) => {
        switch (status) {
        case "approved":
            return <CheckCircle className="h-3 w-3 mr-2 self-center text-green-600" />
        case "under_review":
            return <Clock className="h-3 w-3 mr-2 self-center text-blue-600" />
        case "rejected":
            return <AlertCircle className="h-3 w-3 mr-2 self-center text-red-600" />
        default:
            return <Clock className="h-3 w-3 mr-2 self-center text-gray-600" />
        }
    }
    const getStatusBadge = (status: string) => {
        const variants = {
          pending: "secondary",
          approved: "default",
          under_review: "outline",
          rejected: "destructive",
          active: "default",
          maintenance: "secondary",
        } as const

        return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{getStatusIcon(status)} {status.replace("_", " ")}</Badge>
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href={role === "operator" ? "/client/dashboard" :"/admin/dashboard"} className="mr-4">
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
        { role === "admin" &&
        <Card>
          <CardContent className="pt-5 flex flex-row justify-between">
            <CardTitle>Admin Actions</CardTitle>
            <div className="flex flex-row gap-3 justify end">
              <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600"
                  onClick={() => handleEditApplication(application)}>
                <Edit className="h-4 w-4"/>
              </Button>

              {(application.status === "pending" || application.status === "under_review") && (
                <>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600"
                    onClick={() => handleUpdateApplicationStatus(application._id, "approved")}
                >
                    <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleUpdateApplicationStatus(application._id, "rejected")}
                >
                    <XCircle className="h-4 w-4" />
                </Button>
                </>
            )}
        
            <DeleteApplicationDialog
                  deleteDialog={deleteDialog}
                  application={application}
                  setDeleteDialog={setDeleteDialog}
                  handleDeleteApplication={handleDeleteApplication}
              />
            </div>
          </CardContent>
        </Card>
        }
        
        <Card>
          <CardHeader>
            <CardTitle>Operator Information</CardTitle>
            <CardDescription>Details about the applicant</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="font-medium text-gray-500 text-sm">Operator Name</p>{application.operatorName}</div>
            <div><p className="font-medium text-gray-500 text-sm">Contact Person</p>{application.contactPerson}</div>
            <div><p className="font-medium text-gray-500 text-sm">Email</p>{application.email}</div>
            <div><p className="font-medium text-gray-500 text-sm">Phone</p>{application.phone}</div>
            <div className="md:col-span-2"><p className="font-medium text-gray-500 text-sm">Address</p>{application.address}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="font-medium text-gray-500 text-sm">Route</p>{application.routeFrom} → {application.routeTo}</div>
            <div><p className="font-medium text-gray-500 text-sm">Vehicles</p>{application.vehicleCount}</div>
            <div><p className="font-medium text-gray-500 text-sm">Operating Hours</p>{application.operatingHours}</div>
            <div><p className="font-medium text-gray-500 text-sm">Status</p>{getStatusBadge(application.status)}</div>
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
        <EditApplicationDialog
          editDialog={editDialog}
          setEditDialog={setEditDialog} 
          handleSaveEdit={handleSaveEdit}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
        />
      </main>
    </div>
  )
}
