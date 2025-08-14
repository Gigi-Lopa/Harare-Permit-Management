import React from 'react'
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
} from "lucide-react"

interface props {
    getStatusBadge : (value: string) => React.ReactNode
}
function Vehicles({getStatusBadge}: props) {
  return (
   <TabsContent value="vehicles" className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
            <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
            </Button>
        </div>

        <Card>
            <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search vehicles..." className="pl-10" />
                </div>
                </div>
                <Select defaultValue="all">
                <SelectTrigger className="w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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
                    <TableHead>Last Inspection</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {[
                    {
                    id: "VEH-001",
                    registrationNumber: "AEZ 1234",
                    operatorName: "City Express Transport",
                    model: "Toyota Hiace",
                    capacity: 14,
                    route: "CBD - Chitungwiza",
                    status: "active",
                    lastInspection: "2024-01-01",
                    },
                    {
                    id: "VEH-002",
                    registrationNumber: "AEZ 5678",
                    operatorName: "Harare Commuter Services",
                    model: "Nissan Caravan",
                    capacity: 16,
                    route: "CBD - Mbare",
                    status: "maintenance",
                    lastInspection: "2023-12-15",
                    },
                ].map((vehicle) => (
                    <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.registrationNumber}</TableCell>
                    <TableCell>{vehicle.operatorName}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.capacity} passengers</TableCell>
                    <TableCell>{vehicle.route}</TableCell>
                    <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.lastInspection}</TableCell>
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
            </CardContent>
        </Card>
    </TabsContent>
  )
}

export default Vehicles