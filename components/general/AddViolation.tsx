import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { LocalUser } from "@/types"

interface AddViolationDialogProps {
  vehicleId: string;
  user : LocalUser,
  onViolationAdded: (violation: any, isUnknown: boolean) => void
}

export function AddViolationDialog({ user, vehicleId, onViolationAdded }: AddViolationDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    violation: "",
    fine: "",
    plate : ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/officer/violations/${vehicleId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token_payload}`,
        },
        body: JSON.stringify(formData), 
      }
    )

    if (!res.ok) {
      throw new Error("Failed to add violation")
    }

    const data = await res.json()
    const violation = data.violation

    onViolationAdded(violation, vehicleId === "UNKNOWN")
    toast.success("Violation added successfully")
    setOpen(false)
    setFormData({ violation: "", fine: "" , plate : ""})
  } catch (err) {
    console.error(err)
    toast.error("Failed to add violation")
  }
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">+ Add Violation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Violation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {
            vehicleId === "UNKNOWN" && 
            <div>
              <Label htmlFor="violation">license Plate</Label>
              <Input
                id="plate"
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                placeholder="Enter Plate Number"
                required
              />
            </div>
          }
          <div>
            <Label htmlFor="violation">Violation</Label>
            <Textarea
              id="violation"
              name="violation"
              value={formData.violation}
              onChange={handleChange}
              placeholder="Enter violation description"
              required
            />
          </div>
          <div>
            <Label htmlFor="fine">Fine</Label>
            <Input
              id="fine"
              name="fine"
              value={formData.fine}
              onChange={handleChange}
              placeholder="e.g. $50"
              required
            />
          </div>
          <Button type="submit" className="w-full">Save Violation</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
