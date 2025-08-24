import React from 'react'
import { Button } from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import { Badge } from '@/components/ui/badge'
import {
  Eye,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Officer } from '@/types'

interface props{
    officer : Officer
}
function ViewOfficerDialog({officer}:props) {
  return (
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
                    <p className="text-sm font-mono">{officer.badgeNumber}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm">
                    {officer.firstName} {officer.lastName}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-600">Rank</Label>
                    <p className="text-sm">{officer.rank.replace("_", " ").toUpperCase()}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-600">Department</Label>
                    <p className="text-sm">{officer.department.replace("_", " ").toUpperCase()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">{officer.email}</p>
                </div>
                <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">{officer.phoneNumber}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                    <p className="text-sm">{officer.createdAt}</p>
                </div>
            </div>
            <div>
                <Label className="text-sm font-medium text-gray-600 mr-4">Status</Label>
                <Badge
                    variant={officer.status === "active" ? "default" : "secondary"}
                    className="text-sm"
                >
                    {officer.status.replace("_", " ")}
                </Badge>
            </div>
        </div>
        </DialogContent>
    </Dialog>
  )
}

export default ViewOfficerDialog
