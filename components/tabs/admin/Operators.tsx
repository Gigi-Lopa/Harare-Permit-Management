import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import useAdmin from '@/hooks/useAdmin'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  UserPlus,
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
import { Label } from '@/components/ui/label'
import { Application } from '@/types'

function Operators() {
  return (
     <TabsContent value="operators">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Transport Operators</h2>
            <Dialog>
                <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Operator
                </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Operator</DialogTitle>
                    <DialogDescription>Register a new transport operator</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="newOperatorName">Company Name</Label>
                        <Input id="newOperatorName" placeholder="Enter company name" />
                    </div>
                    <div>
                        <Label htmlFor="newContactPerson">Contact Person</Label>
                        <Input id="newContactPerson" placeholder="Enter contact person" />
                    </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="newEmail">Email</Label>
                        <Input id="newEmail" type="email" placeholder="Enter email" />
                    </div>
                    <div>
                        <Label htmlFor="newPhone">Phone</Label>
                        <Input id="newPhone" placeholder="Enter phone number" />
                    </div>
                    </div>
                    <div>
                    <Label htmlFor="newAddress">Business Address</Label>
                    <Input id="newAddress" placeholder="Enter business address" />
                    </div>
                    <div>
                    <Label htmlFor="newBusinessReg">Business Registration</Label>
                    <Input id="newBusinessReg" placeholder="Enter registration number" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Add Operator</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>

            <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Search operators..." className="pl-10" />
                    </div>
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
                </div>

                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Operator Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Active Permits</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[
                    {
                        id: 1,
                        operatorName: "City Express Transport",
                        contactPerson: "John Mukamuri",
                        email: "john@cityexpress.co.zw",
                        phone: "+263 77 123 4567",
                        activePermits: 3,
                        vehicles: 12,
                        status: "active",
                        businessReg: "BR-2020-001",
                        address: "123 Samora Machel Avenue, Harare",
                        joinDate: "2020-01-15",
                    },
                    {
                        id: 2,
                        operatorName: "Harare Commuter Services",
                        contactPerson: "Mary Chikwanha",
                        email: "mary@hcs.co.zw",
                        phone: "+263 77 234 5678",
                        activePermits: 5,
                        vehicles: 18,
                        status: "active",
                        businessReg: "BR-2019-045",
                        address: "456 Robert Mugabe Road, Harare",
                        joinDate: "2019-03-22",
                    },
                    {
                        id: 3,
                        operatorName: "Metro Bus Lines",
                        contactPerson: "Peter Moyo",
                        email: "peter@metrobus.co.zw",
                        phone: "+263 77 345 6789",
                        activePermits: 2,
                        vehicles: 8,
                        status: "suspended",
                        businessReg: "BR-2021-023",
                        address: "789 Julius Nyerere Way, Harare",
                        joinDate: "2021-06-10",
                    },
                    ].map((operator) => (
                    <TableRow key={operator.id}>
                        <TableCell className="font-medium">{operator.operatorName}</TableCell>
                        <TableCell>{operator.contactPerson}</TableCell>
                        <TableCell>{operator.email}</TableCell>
                        <TableCell>{operator.phone}</TableCell>
                        <TableCell>{operator.activePermits}</TableCell>
                        <TableCell>{operator.vehicles}</TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            operator.status === "active"
                                ? "default"
                                : operator.status === "suspended"
                                ? "destructive"
                                : "secondary"
                            }
                        >
                            {operator.status}
                        </Badge>
                        </TableCell>
                        <TableCell>
                        <div className="flex space-x-2">
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                <DialogTitle>Operator Details</DialogTitle>
                                <DialogDescription>{operator.operatorName}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                                    <p className="text-lg">{operator.operatorName}</p>
                                    </div>
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Contact Person</Label>
                                    <p className="text-lg">{operator.contactPerson}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                                    <p className="text-lg">{operator.email}</p>
                                    </div>
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                                    <p className="text-lg">{operator.phone}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Business Address</Label>
                                    <p className="text-lg">{operator.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">
                                        Business Registration
                                    </Label>
                                    <p className="text-lg">{operator.businessReg}</p>
                                    </div>
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                                    <p className="text-lg">{operator.joinDate}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Active Permits</Label>
                                    <p className="text-2xl font-bold text-green-600">{operator.activePermits}</p>
                                    </div>
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Total Vehicles</Label>
                                    <p className="text-2xl font-bold text-blue-600">{operator.vehicles}</p>
                                    </div>
                                    <div>
                                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                                    <Badge
                                        variant={operator.status === "active" ? "default" : "destructive"}
                                        className="text-sm"
                                    >
                                        {operator.status}
                                    </Badge>
                                    </div>
                                </div>
                                </div>
                                <DialogFooter>
                                <Button variant="outline">Close</Button>
                                </DialogFooter>
                            </DialogContent>
                            </Dialog>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                <DialogTitle>Edit Operator</DialogTitle>
                                <DialogDescription>Update operator information</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="editOperatorName">Company Name</Label>
                                    <Input id="editOperatorName" defaultValue={operator.operatorName} />
                                    </div>
                                    <div>
                                    <Label htmlFor="editContactPerson">Contact Person</Label>
                                    <Input id="editContactPerson" defaultValue={operator.contactPerson} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="editEmail">Email</Label>
                                    <Input id="editEmail" type="email" defaultValue={operator.email} />
                                    </div>
                                    <div>
                                    <Label htmlFor="editPhone">Phone</Label>
                                    <Input id="editPhone" defaultValue={operator.phone} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="editAddress">Business Address</Label>
                                    <Input id="editAddress" defaultValue={operator.address} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                    <Label htmlFor="editBusinessReg">Business Registration</Label>
                                    <Input id="editBusinessReg" defaultValue={operator.businessReg} />
                                    </div>
                                    <div>
                                    <Label htmlFor="editStatus">Status</Label>
                                    <Select defaultValue={operator.status}>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    </div>
                                </div>
                                </div>
                                <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                            </Dialog>
                            <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Delete Operator</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete {operator.operatorName}? This will also affect all
                                    associated permits and vehicles. This action cannot be undone.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-red-800">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-medium">Warning: This will delete:</span>
                                </div>
                                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                    <li>{operator.activePermits} active permits</li>
                                    <li>{operator.vehicles} registered vehicles</li>
                                    <li>All associated applications and history</li>
                                </ul>
                                </div>
                                <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive">Delete Operator</Button>
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
        </div>
    </TabsContent>
  )
}

export default Operators