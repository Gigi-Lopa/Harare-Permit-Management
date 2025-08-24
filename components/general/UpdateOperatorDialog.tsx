import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LocalUser, Operator } from "@/types"
import useGetUserInfor from "@/hooks/useGetUserInfor"

interface Props {
  operator: Operator
  onUpdate?: (updatedOperator: Operator) => void
}

function UpdateOperatorDialog({ operator, onUpdate }: Props) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const payload = {
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        status: formData.get("status") as string,
        businessInformation: {
            companyName: formData.get("companyName") as string,
            contactPerson: formData.get("contactPerson") as string,
            businessAddress: formData.get("businessAddress") as string,
            businessRegistration: formData.get("businessRegistration") as string,
        },
        }

        try {
            const  user:LocalUser |  null = useGetUserInfor()
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/operators/${operator._id}`, {
                method: "PUT",
                headers : {
                    "Content-Type": "application/json",
                    "Authorization" : `Bearer ${user?.token_payload}`
                },
                body: JSON.stringify(payload),
            })
            setLoading(false)
            if (!res.ok) {
                throw new Error("Failed to update operator")
            }

            const data = await res.json()
            if (onUpdate) {
                onUpdate(data.operator) 
            }
            setOpen(false)
        } catch (err) {
        console.error("Error updating operator:", err)
        }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        {/* form starts here */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" defaultValue={operator.businessInformation.companyName} />
            </div>
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" defaultValue={operator.businessInformation.contactPerson} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={operator.email} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={operator.phone} />
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input id="businessAddress" name="businessAddress" defaultValue={operator.businessInformation.businessAddress} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessRegistration">Business Registration</Label>
              <Input id="businessRegistration" name="businessRegistration" defaultValue={operator.businessInformation.businessRegistration} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={operator.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={()=>setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled = {loading}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateOperatorDialog
