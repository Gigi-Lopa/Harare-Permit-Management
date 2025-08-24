import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VehicleFull } from "@/types"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface Props {
  open: boolean
  selectedVehicle: VehicleFull | null
  token: string
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onUpdated?: () => void 
}

function UpdateVehicleDialog({ open, setOpen, selectedVehicle, token, onUpdated }: Props) {
  const [formData, setFormData] = useState({
    status: "pending_approval",
    operatingRoute: "",
    driverName: "",
    driverLicenseNumber: "",
    driverLicenseExpiry: "",
    insuranceExpiryDate: "",
    roadworthyExpiryDate: "",
  })

  const [status, setStatus] = useState({
    error: false,
    success: false,
    loading: false,
  })

  useEffect(() => {
    if (selectedVehicle) {
      setFormData({
        status: selectedVehicle.status || "pending_approval",
        operatingRoute: selectedVehicle.operatingRoute || "",
        driverName: selectedVehicle.driverName || "",
        driverLicenseNumber: selectedVehicle.driverLicenseNumber || "",
        driverLicenseExpiry: selectedVehicle.driverLicenseExpiry || "",
        insuranceExpiryDate: selectedVehicle.insuranceExpiryDate || "",
        roadworthyExpiryDate: selectedVehicle.roadworthyExpiryDate || "",
      })
    }
  }, [selectedVehicle])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value })
  }

  const handleSubmit = async () => {
    if (!selectedVehicle) return
    setStatus({ ...status, loading: true, error: false, success: false })

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/update/${selectedVehicle._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus({ loading: false, success: true, error: false })
        if (onUpdated) onUpdated()
        setTimeout(() => setOpen(false), 3000)
      } else {
        setStatus({ loading: false, success: false, error: true })
        console.error("Failed to update vehicle:", data)
      }
    } catch (error) {
      console.error("Error updating vehicle:", error)
      setStatus({ loading: false, success: false, error: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Vehicle</DialogTitle>
          <DialogDescription>Modify and save vehicle information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="grid grid-cols-2 gap-4 p-4">
              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_review">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Operating Route</Label>
                <Input
                  name="operatingRoute"
                  value={formData.operatingRoute}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Driver Name</Label>
                <Input name="driverName" value={formData.driverName} onChange={handleChange} />
              </div>
              <div>
                <Label>License Number</Label>
                <Input
                  name="driverLicenseNumber"
                  value={formData.driverLicenseNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  name="driverLicenseExpiry"
                  value={formData.driverLicenseExpiry}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Insurance Expiry</Label>
                <Input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Roadworthy Expiry</Label>
                <Input
                  type="date"
                  name="roadworthyExpiryDate"
                  value={formData.roadworthyExpiryDate}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {status.success && (
            <Alert className="border-green-200 bg-green-50 flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Vehicle updated successfully!
                </AlertDescription>
              </div>
            </Alert>
          )}
          {status.error && (
            <Alert className="border-red-200 bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Something went wrong. Please try again later.
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={status.loading}>
              {status.loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateVehicleDialog
