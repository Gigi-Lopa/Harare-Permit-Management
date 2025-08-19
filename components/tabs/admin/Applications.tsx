import React, {useEffect, useState} from 'react'
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
  Edit,
  ChevronRight,
  ChevronLeft,
  ExternalLink
} from "lucide-react"
import { Application, LocalUser } from '@/types'
import useGetUserInfor from '@/hooks/useGetUserInfor'
import EditApplicationDialog from '@/components/general/EditApplicationDialog'
import DeleteApplicationDialog from '@/components/general/DeleteApplicationDialog'
import EmptyScreen from '@/components/general/EmptyScreen'
import Link from 'next/link'
interface props{
    getStatusBadge : (valaue : string) => React.ReactNode
}

function Applications({ getStatusBadge}:props) {
    const [page, setPage] = useState(1)
    const {   
        filteredApplications,
        deleteDialog,
        searchTerm,
        statusFilter,
        editDialog,
        editFormData,
        applications,
        pagination,
        setStatusFilter,
        setSearchTerm,
        setDeleteDialog,
        handleDeleteApplication,
        handleEditApplication,
        handleUpdateApplicationStatus,
        setEditFormData,
        setEditDialog,
        handleSaveEdit,
        getApplications
        } = useAdmin();
    
    useEffect(() => {
        const user:LocalUser | null = useGetUserInfor()
        getApplications(user?.token_payload ?? null, page)
    }, [page])
      
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
            </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Permit Applications</CardTitle>
            <CardDescription>
                Showing {applications.length} of {pagination?.total_items ?? 0} applications
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
                    {applications.map((app: Application) => (
                        <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.applicationId}</TableCell>
                        <TableCell>
                            <div>
                                <p className="font-medium">{app.operatorName}</p>
                                <p className="text-sm text-gray-600">{app.contactPerson}</p>
                            </div>
                        </TableCell>
                        <TableCell>{app.routeFrom} - {app.routeTo}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>{app.submittedDate}</TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Link href = {`/uni/application?id=${app.applicationId}`} className='self-center'>
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                                
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
                                <DeleteApplicationDialog
                                    deleteDialog={deleteDialog}
                                    application={app}
                                    setDeleteDialog={setDeleteDialog}
                                    handleDeleteApplication={handleDeleteApplication}
                                />
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    {
                        applications.length === 0 &&
                        <TableRow>
                            <TableCell colSpan={6}>
                                <EmptyScreen message='No applications' />
                            </TableCell>
                        </TableRow> 
                    }
                </TableBody>
            </Table>
            {pagination && (
              <div className='w-full flex flex-row items-center justify-center'>
                <Button
                  variant="ghost"
                  disabled={!pagination.has_previous}
                  onClick={() => setPage(pagination.previous_page || 1)}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>

                <p className='text-gray-600'>
                  {pagination.current_page} / {pagination.total_pages}
                </p>

                <Button
                  variant="ghost"
                  disabled={!pagination.has_next}
                  onClick={() => setPage(pagination.next_page || pagination.total_pages)}
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            )}
            </CardContent>
        </Card>
        <EditApplicationDialog
            editDialog={editDialog}
            setEditDialog={setEditDialog} 
            handleSaveEdit={handleSaveEdit}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
        />
        </TabsContent>
  )
}

export default Applications