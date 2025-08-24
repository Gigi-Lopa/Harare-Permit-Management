import React, { use, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Trash2,
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
import { Officer } from '@/types'
import useGetUserInfor from "@/hooks/useGetUserInfor"

interface Props {
  officer: Officer
  onDelete?: () => void  
}

function DeleteOfficerDialog({ officer, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setLoading(true)
      const token = useGetUserInfor()?.token_payload || ""
      const identifier = officer._id || officer.badgeNumber

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/officers/${identifier}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        if (onDelete) onDelete()
        setOpen(false)
      } else {
        const errorData = await res.json()
        console.error("Delete failed:", errorData.error)
        alert(errorData.error || "Failed to delete officer")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred while deleting officer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Officer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete officer {officer.badgeNumber} (
            {officer.firstName} {officer.lastName})? This action cannot be undone.
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Officer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteOfficerDialog
