import React, { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { LocalUser, Operator } from '@/types'
import useGetUserInfor from "@/hooks/useGetUserInfor"

interface Props {
  operator: Operator
  onDelete?: () => void   // refresh table in parent
}

function DeleteOperatorDialog({ operator, onDelete }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
        const  user:LocalUser |  null = useGetUserInfor()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operators/${operator._id}`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token_payload}`,
            },
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete operator")
      }

      toast({
        title: "Deleted",
        description: `${operator.businessInformation.companyName} was removed successfully.`,
      })

      onDelete?.()
      setOpen(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
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
          <DialogTitle>Delete Operator</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{operator.businessInformation.companyName}</strong>? 
            This will also affect all associated permits and vehicles. This action cannot be undone.
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
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Operator"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteOperatorDialog
