import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useAdmin from '@/hooks/useAdmin'
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit,
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
import { Application } from '@/types'

interface props{
    applications : Application[],
    getStatusBadge : (valaue : string) => React.ReactNode
}

function Applications({applications, getStatusBadge}:props) {
     const {   
        filteredApplications,
        deleteDialog,
        searchTerm,
        statusFilter,
        setStatusFilter,
        setSearchTerm,
        setViewDialog,
        setDeleteDialog,
        handleDeleteApplication,
        handleEditApplication,
        handleUpdateApplicationStatus,
        } = useAdmin();
  return (
     <TabsContent value="applications" className="space-y-6">
        <Card>
            <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    />
                </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
                </Select>
                <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
                </Button>
            </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Permit Applications</CardTitle>
            <CardDescription>
                Showing {filteredApplications.length} of {applications.length} applications
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredApplications.map((app: any) => (
                    <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>
                        <div>
                        <p className="font-medium">{app.operatorName}</p>
                        <p className="text-sm text-gray-600">{app.contactPerson}</p>
                        </div>
                    </TableCell>
                    <TableCell>{app.route}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                        <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewDialog({ open: true, application: app })}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600"
                            onClick={() => handleEditApplication(app)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        {app.status === "pending" && (
                            <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleUpdateApplicationStatus(app.id, "approved")}
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => handleUpdateApplicationStatus(app.id, "rejected")}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                            </>
                        )}
                        <Dialog
                            open={deleteDialog.open && deleteDialog.applicationId === app.id}
                            onOpenChange={(open) =>
                            setDeleteDialog({ open, applicationId: app.id, operatorName: app.operatorName })
                            }
                        >
                            <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </DialogTrigger>
                            <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Application</DialogTitle>
                                <DialogDescription>
                                Are you sure you want to delete application {app.id} from {app.operatorName}? This
                                action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                variant="outline"
                                onClick={() =>
                                    setDeleteDialog({ open: false, applicationId: "", operatorName: "" })
                                }
                                >
                                Cancel
                                </Button>
                                <Button variant="destructive" onClick={() => handleDeleteApplication(app.id)}>
                                Delete
                                </Button>
                            </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        </TabsContent>
  )
}

export default Applications