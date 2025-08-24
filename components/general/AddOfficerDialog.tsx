import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useGetUserInfor from "@/hooks/useGetUserInfor"

interface Props {
  onAddOfficer: () => void
}

export default function AddOfficerDialog({ onAddOfficer }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rank, setRank] = useState("")
  const [department, setDepartment] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phoneNumber: formData.get("phone"),
      rank: rank,
      department: department,
      password: formData.get("password"),
    }

    try {
        const user = useGetUserInfor()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/create/officer`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token_payload}`, 
            },
            body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (res.ok) {
            onAddOfficer()
            setOpen(false) 
        } else {
            alert(data.message || "Failed to create officer")
        }
        } catch (err) {
            console.error("Error creating officer:", err)
            alert("Internal error")
        } finally {
        setLoading(false)
        }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Officer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Officer</DialogTitle>
          <DialogDescription>
            Register a new traffic enforcement officer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required placeholder="Enter first name" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required placeholder="Enter last name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rank">Rank</Label>
              <Select value={rank} onValueChange={setRank}>
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
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="Enter email" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required placeholder="Enter phone number" />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Temporary Password</Label>
            <Input id="password" name="password" type="password" required placeholder="Enter temporary password" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !rank || !department}>
              {loading ? "Adding..." : "Add Officer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
