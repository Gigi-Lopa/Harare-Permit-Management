import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import useAdmin from '@/hooks/useAdmin'
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import useAdminVehicles from '@/hooks/useAdminVehicles'
import useGetUserInfor from '@/hooks/useGetUserInfor'
import { LocalUser, Vehicle } from '@/types'
import Link from 'next/link'

interface props {
    getStatusBadge : (value: string) => React.ReactNode
}
function Vehicles({getStatusBadge}: props) {
    const {
        user,
        vehicles,
        pagination,
        setUser,
        getVehicles
    } = useAdminVehicles();
    const [page, setPage] = useState(1)
    const [filterOption, setFilterOption] = useState("default")
 
    useEffect(() => {
          const user:LocalUser | null = useGetUserInfor()
          getVehicles(page, user?.token_payload ?? null ,filterOption)
      }, [page, filterOption])
  
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
                    <Input placeholder="Search vehicles..." className="pl-10" />
                </div>
                </div>
                <Select defaultValue="default">
                <SelectTrigger className="w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
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
                        <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
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
    </TabsContent>
  )
}

export default Vehicles