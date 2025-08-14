import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Plus,
  Search,
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


function Officers() {
  return (
    <TabsContent value="officers" className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Traffic Officers</h2>
            <Dialog>
            <DialogTrigger asChild>
                <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Officer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Add New Officer</DialogTitle>
                <DialogDescription>Register a new traffic enforcement officer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="newOfficerFirstName">First Name</Label>
                    <Input id="newOfficerFirstName" placeholder="Enter first name" />
                    </div>
                    <div>
                    <Label htmlFor="newOfficerLastName">Last Name</Label>
                    <Input id="newOfficerLastName" placeholder="Enter last name" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="newOfficerBadge">Badge Number</Label>
                    <Input id="newOfficerBadge" placeholder="e.g., OFF-001" />
                    </div>
                    <div>
                    <Label htmlFor="newOfficerRank">Rank</Label>
                    <Select>
                        <SelectTrigger>
                        <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="officer">Officer</SelectItem>
                        <SelectItem value="senior_officer">Senior Officer</SelectItem>
                        <SelectItem value="inspector">Inspector</SelectItem>
                        <SelectItem value="chief_inspector">Chief Inspector</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="newOfficerEmail">Email</Label>
                    <Input id="newOfficerEmail" type="email" placeholder="Enter email" />
                    </div>
                    <div>
                    <Label htmlFor="newOfficerPhone">Phone</Label>
                    <Input id="newOfficerPhone" placeholder="Enter phone number" />
                    </div>
                </div>
                <div>
                    <Label htmlFor="newOfficerDepartment">Department</Label>
                    <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="traffic_enforcement">Traffic Enforcement</SelectItem>
                        <SelectItem value="permit_compliance">Permit Compliance</SelectItem>
                        <SelectItem value="vehicle_inspection">Vehicle Inspection</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="newOfficerPassword">Temporary Password</Label>
                    <Input id="newOfficerPassword" type="password" placeholder="Enter temporary password" />
                </div>
                </div>
                <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Add Officer</Button>
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
                    <Input placeholder="Search officers..." className="pl-10" />
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
                    <SelectItem value="on_leave">On Leave</SelectItem>
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
                    <TableHead>Badge Number</TableHead>
                    <TableHead>Officer Name</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {[
                    {
                    id: 1,
                    badgeNumber: "OFF-001",
                    firstName: "James",
                    lastName: "Mutindi",
                    rank: "Senior Officer",
                    department: "Traffic Enforcement",
                    email: "james.mutindi@harare.gov.zw",
                    phone: "+263 77 111 2222",
                    status: "active",
                    joinDate: "2020-03-15",
                    lastLogin: "2024-01-20 09:30",
                    },
                    {
                    id: 2,
                    badgeNumber: "OFF-002",
                    firstName: "Grace",
                    lastName: "Nyamande",
                    rank: "Officer",
                    department: "Permit Compliance",
                    email: "grace.nyamande@harare.gov.zw",
                    phone: "+263 77 333 4444",
                    status: "active",
                    joinDate: "2021-07-22",
                    lastLogin: "2024-01-20 08:15",
                    },
                    {
                    id: 3,
                    badgeNumber: "OFF-003",
                    firstName: "Robert",
                    lastName: "Chikwanha",
                    rank: "Inspector",
                    department: "Vehicle Inspection",
                    email: "robert.chikwanha@harare.gov.zw",
                    phone: "+263 77 555 6666",
                    status: "on_leave",
                    joinDate: "2019-01-10",
                    lastLogin: "2024-01-18 16:45",
                    },
                ].map((officer) => (
                    <TableRow key={officer.id}>
                    <TableCell className="font-medium font-mono">{officer.badgeNumber}</TableCell>
                    <TableCell>
                        <div>
                        <p className="font-medium">
                            {officer.firstName} {officer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Joined: {officer.joinDate}</p>
                        </div>
                    </TableCell>
                    <TableCell>{officer.rank}</TableCell>
                    <TableCell>{officer.department}</TableCell>
                    <TableCell>{officer.email}</TableCell>
                    <TableCell>{officer.phone}</TableCell>
                    <TableCell>
                        <Badge
                        variant={
                            officer.status === "active"
                            ? "default"
                            : officer.status === "on_leave"
                                ? "secondary"
                                : "destructive"
                        }
                        >
                        {officer.status.replace("_", " ")}
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
                                <DialogTitle>Officer Details</DialogTitle>
                                <DialogDescription>
                                {officer.badgeNumber} - {officer.firstName} {officer.lastName}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Badge Number</Label>
                                    <p className="text-lg font-mono">{officer.badgeNumber}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                                    <p className="text-lg">
                                    {officer.firstName} {officer.lastName}
                                    </p>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Rank</Label>
                                    <p className="text-lg">{officer.rank}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Department</Label>
                                    <p className="text-lg">{officer.department}</p>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                                    <p className="text-lg">{officer.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                                    <p className="text-lg">{officer.phone}</p>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                                    <p className="text-lg">{officer.joinDate}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                                    <p className="text-lg">{officer.lastLogin}</p>
                                </div>
                                </div>
                                <div>
                                <Label className="text-sm font-medium text-gray-600">Status</Label>
                                <Badge
                                    variant={officer.status === "active" ? "default" : "secondary"}
                                    className="text-sm"
                                >
                                    {officer.status.replace("_", " ")}
                                </Badge>
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
                                <DialogTitle>Edit Officer</DialogTitle>
                                <DialogDescription>Update officer information</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editOfficerFirstName">First Name</Label>
                                    <Input id="editOfficerFirstName" defaultValue={officer.firstName} />
                                </div>
                                <div>
                                    <Label htmlFor="editOfficerLastName">Last Name</Label>
                                    <Input id="editOfficerLastName" defaultValue={officer.lastName} />
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editOfficerBadge">Badge Number</Label>
                                    <Input id="editOfficerBadge" defaultValue={officer.badgeNumber} />
                                </div>
                                <div>
                                    <Label htmlFor="editOfficerRank">Rank</Label>
                                    <Select defaultValue={officer.rank.toLowerCase().replace(" ", "_")}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="officer">Officer</SelectItem>
                                        <SelectItem value="senior_officer">Senior Officer</SelectItem>
                                        <SelectItem value="inspector">Inspector</SelectItem>
                                        <SelectItem value="chief_inspector">Chief Inspector</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editOfficerEmail">Email</Label>
                                    <Input id="editOfficerEmail" type="email" defaultValue={officer.email} />
                                </div>
                                <div>
                                    <Label htmlFor="editOfficerPhone">Phone</Label>
                                    <Input id="editOfficerPhone" defaultValue={officer.phone} />
                                </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editOfficerDepartment">Department</Label>
                                    <Select defaultValue={officer.department.toLowerCase().replace(" ", "_")}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="traffic_enforcement">Traffic Enforcement</SelectItem>
                                        <SelectItem value="permit_compliance">Permit Compliance</SelectItem>
                                        <SelectItem value="vehicle_inspection">Vehicle Inspection</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="editOfficerStatus">Status</Label>
                                    <Select defaultValue={officer.status}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
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
                                <DialogTitle>Delete Officer</DialogTitle>
                                <DialogDescription>
                                Are you sure you want to delete officer {officer.badgeNumber} ({officer.firstName}{" "}
                                {officer.lastName})? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-red-800">
                                <AlertCircle className="h-5 w-5" />
                                <span className="font-medium">Warning: This will delete:</span>
                                </div>
                                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                <li>Officer account and login access</li>
                                <li>All search history and activity logs</li>
                                <li>Associated reports and documentation</li>
                                </ul>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button variant="destructive">Delete Officer</Button>
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

export default Officers