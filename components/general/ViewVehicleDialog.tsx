import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleFull } from '@/types'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedVehicle: VehicleFull | null
  getStatusBadge: (value: string) => React.ReactNode
}

function ViewVehicleDialog({ open, setOpen, selectedVehicle, getStatusBadge }: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Vehicle Details</DialogTitle>
          <DialogDescription>Complete vehicle information</DialogDescription>
        </DialogHeader>

        {selectedVehicle ? (
          <div className="space-y-6">
            {/* Vehicle Info */}
            <Card className="rounded">
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <p><span className="font-semibold">Registration:</span> {selectedVehicle.registrationNumber}</p>
                <p><span className="font-semibold">Make:</span> {selectedVehicle.make}</p>
                <p><span className="font-semibold">Model:</span> {selectedVehicle.model}</p>
                <p><span className="font-semibold">Year:</span> {selectedVehicle.year}</p>
                <p><span className="font-semibold">Capacity:</span> {selectedVehicle.capacity}</p>
                <p><span className="font-semibold">Color:</span> {selectedVehicle.color}</p>
                <p><span className="font-semibold">Fuel Type:</span> {selectedVehicle.fuelType}</p>
                <p><span className="font-semibold">Status:</span> {getStatusBadge(selectedVehicle.status)}</p>
              </CardContent>
            </Card>

            {/* Driver Info */}
            <Card className="rounded">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Driver</h4>
                <p>{selectedVehicle.driverName} ({selectedVehicle.driverLicenseNumber})</p>
                <p className="text-sm text-gray-700">Expiry: {selectedVehicle.driverLicenseExpiry}</p>
              </CardContent>
            </Card>

         
            <Card className="rounded">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Insurance</h4>
                <p>Company: {selectedVehicle.insuranceCompany}</p>
                <p>Policy #: {selectedVehicle.insurancePolicyNumber}</p>
                <p>Expires: {selectedVehicle.insuranceExpiryDate}</p>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            <Card className="rounded">
              <CardContent className="p-4">
                <h4 className="font-semibold text-lg mb-2">Uploaded Files</h4>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(selectedVehicle.uploadedFiles || {}).map(([key, value]) => (
                    <li key={key}>
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}/api/files/download?path=${value}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {key}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-gray-600">Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewVehicleDialog
