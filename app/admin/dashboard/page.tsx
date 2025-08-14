"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import {
  Bus,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  LogOut,
  UserPlus,
  Trash2,
  Edit,
  Plus,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ApplicationViewDialog } from "@/components/application-view-dialog"
import useAdmin from "@/hooks/useAdmin"
import AdminCards from "@/components/general/AdminCards"
import Applications from "@/components/tabs/admin/Applications"
import Vehicles from "@/components/tabs/admin/Vehicles"
import Reports from "@/components/tabs/admin/Reports"
import Officers from "@/components/tabs/admin/Officers"

export default function AdminDashboardPage() {
  const {   
    user,
    applications,
    editDialog,
    viewDialog, 
    editFormData,
    setEditFormData,
    setViewDialog,
    setEditDialog,
    handleLogout,
    handleSaveEdit} = useAdmin();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      under_review: "outline",
      rejected: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace("_", " ")}</Badge>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Harare City Council - Permit Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {user.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ""}` : "A"}
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
        {/* Stats Grid */}
       <AdminCards
          totalActiveVehicles={254}
          totalApplications={500}
          totalPendingReviews={700}
          totalRegisteredOperators={52}
       />
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>

          </TabsList>

          <Applications applications={applications} getStatusBadge={getStatusBadge}/>
          <Vehicles getStatusBadge={getStatusBadge}/>

          
          <Officers/>
           <Reports/>
         
          
        </Tabs>

        {/* Edit Application Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, application: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
              <DialogDescription>Update application details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operatorName">Operator Name</Label>
                  <Input
                    id="operatorName"
                    value={editFormData.operatorName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, operatorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={editFormData.contactPerson || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="route">Route</Label>
                <Input
                  id="route"
                  value={editFormData.route || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, route: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicleCount">Vehicle Count</Label>
                <Input
                  id="vehicleCount"
                  type="number"
                  value={editFormData.vehicleCount || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, vehicleCount: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editFormData.status || ""}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog({ open: false, application: null })}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Application View Dialog */}
        <ApplicationViewDialog
          open={viewDialog.open}
          onOpenChange={(open) => setViewDialog({ open, application: null })}
          application={viewDialog.application}
        />
      </main>
    </div>
  )
}
