import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Plus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import useAdminVehicles from '@/hooks/useAdminVehicles'
import { Vehicle } from '@/types'
import Link from 'next/link'
import ViewVehicleDialog from '@/components/general/ViewVehicleDialog'
import UpdateVehicleDialog from '@/components/general/UpdateVehicleDialog'
import DeleteVehicleDialog from '@/components/general/DeleteVehicleDialog'
import EmptyScreen from '@/components/general/EmptyScreen'

interface props {
    getStatusBadge : (value: string) => React.ReactNode
}
function Vehicles({getStatusBadge}: props) {
    const {
        user,
        vehicles,
        pagination,
        selectedVehicle,
        open,
        openEditVehicle,
        page,
        filterOption,
        setPage,
        setFilterOption,
        setSearchValue,
        setOpenEditVehicle,
        setOpen,
        fetchVehicleDetails,
        getVehicles
    } = useAdminVehicles();

  return (
   <TabsContent value="vehicles" className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
            <Link href="/uni/vehicles/register">
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register Vehicle
                </Button>
            </Link>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Registered Vehicles</CardTitle>
                <CardDescription>
                    Showing {vehicles ? vehicles.length : 0} of {pagination?.total_items ?? 0} vehicles
                </CardDescription>
            </CardHeader>
            <CardContent className="">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                        placeholder="Search vehicles..."
                        className="pl-10"
                        onChange={(e)=> setSearchValue(e.target.value)}
                    />
                </div>
                </div>
                <Select defaultValue={filterOption} value={filterOption} onValueChange={(val) => setFilterOption(val)} >
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">All Status</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                
                {vehicles &&
                vehicles
                .map((vehicle:Vehicle) => (
                    <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                        <TableCell>{vehicle.operatorName}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.capacity} passengers</TableCell>
                        <TableCell>{vehicle.operatingRoute}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell className='text-center'>{vehicle.registrationDate?.split(" ")[0]}</TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        fetchVehicleDetails(vehicle.id)
                                        setOpen(true)
                                    }}
                                    >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm" 
                                    onClick={() => {
                                        fetchVehicleDetails(vehicle.id)
                                        setOpenEditVehicle(true)
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <DeleteVehicleDialog
                                    vehicleId={vehicle.id}
                                    token={user?.token_payload ?? ""}
                                    onDeleted={() => getVehicles(page, user?.token_payload ?? null, filterOption)}
                                    />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {
                    vehicles &&
                    vehicles.length === 0 &&
                    <TableRow>
                        <TableCell colSpan={8}>
                            <EmptyScreen message='No vehicles registered'/>
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
        <ViewVehicleDialog
            selectedVehicle={selectedVehicle}
            open = {open}     
            setOpen={setOpen}
            getStatusBadge={getStatusBadge}
        />
        {
            selectedVehicle &&
            <UpdateVehicleDialog
                token = {user?.token_payload || ""}
                open={openEditVehicle}
                setOpen={setOpenEditVehicle}
                onUpdated={() => getVehicles(page, user?.token_payload ?? null, filterOption)}
                selectedVehicle={selectedVehicle}
            />
        }
        
    </TabsContent>
  )
}

export default Vehicles