import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react"

interface DeleteVehicleDialogProps {
  vehicleId: string
  token: string
  onDeleted?: () => void
}

function DeleteVehicleDialog({ vehicleId, token, onDeleted }: DeleteVehicleDialogProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState({ loading: false, success: false, error: "" })

  const handleDelete = async () => {
    setStatus({ loading: true, success: false, error: "" })
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles/${vehicleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus({ loading: false, success: true, error: "" })
        if (onDeleted) onDeleted()
        setTimeout(() => setOpen(false), 2000)
      } else {
        setStatus({ loading: false, success: false, error: data.error || "Failed to delete vehicle" })
      }
    } catch (error: any) {
      setStatus({ loading: false, success: false, error: error.message || "Internal server error" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600">
          <span className="sr-only">Delete Vehicle</span>
          <Trash2 className="h-4 w-4"/>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {status.error && (
          <Alert className="border-red-200 bg-red-50 flex items-start gap-2 my-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">{status.error}</AlertDescription>
            </div>
          </Alert>
        )}

        {status.success && (
          <Alert className="border-green-200 bg-green-50 flex items-start gap-2 my-2">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <AlertTitle className="text-green-800">Deleted</AlertTitle>
              <AlertDescription className="text-green-700">Vehicle deleted successfully.</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={status.loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={status.loading}>
            {status.loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteVehicleDialog
