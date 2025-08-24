import React from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import {
  
  Eye,
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
import { Operator } from '@/types'

interface props{
    operator : Operator
}
function ViewOperatorDialog({operator}: props) {
  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Operator Details</DialogTitle>
                <DialogDescription>{operator.firstName} {operator.lastName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                        <p className="">{operator.businessInformation.companyName}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Contact Person</Label>
                        <p className="">{operator.businessInformation.contactPerson}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <p className="">{operator.email}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <p className="">{operator.phone}</p>
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-600">Business Address</Label>
                    <p className="">{operator.businessInformation.businessAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-600">
                        Business Registration
                    </Label>
                    <p className="">{operator.businessInformation.businessRegistration}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                    <p className="">{operator.createdAt}</p>
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
                    <Label className="text-sm font-medium text-gray-600 mr-2">Status</Label>
                    <Badge
                        variant={operator.status === "active" ? "default" : "destructive"}
                        className="text-sm"
                    >
                        {operator.status}
                    </Badge>
                </div>
            </div>
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default ViewOperatorDialog
