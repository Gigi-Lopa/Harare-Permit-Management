import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Props {
  onAddOperator: () => void
}

export default function AddOperatorDialog({ onAddOperator }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      accountType: "operator", 
      companyName: formData.get("companyName"),
      businessRegistration: formData.get("businessRegistration"),
      businessAddress: formData.get("businessAddress"),
      contactPerson: formData.get("contactPerson"),
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        onAddOperator()
        setOpen(false) 
      } else {
        alert(data.message || "Failed to register operator")
      }
    } catch (err) {
      console.error("Error registering operator:", err)
      alert("Internal error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Operator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Operator</DialogTitle>
          <DialogDescription>
            Register a new transport operator
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <div className="space-y-4 pt-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input name="firstName" required placeholder="First Name" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input name="lastName" required placeholder="Last Name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input name="email" type="email" required placeholder="Email" />
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <Input name="phone" required placeholder="Phone Number" />
                  </div>
                </div>
                <div>
                  <Label>Temporary Password *</Label>
                  <Input name="password" type="password" required placeholder="Temporary Password" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mt-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input name="companyName" required placeholder="Enter company name" />
              </div>
              <div>
                <Label>Business Registration *</Label>
                <Input name="businessRegistration" required placeholder="Enter registration number" />
              </div>
            </div>
            <div>
              <Label>Business Address *</Label>
              <Textarea name="businessAddress" required placeholder="Enter business address" />
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input name="contactPerson" placeholder="Enter contact person" />
            </div>
          </div>

          <DialogFooter >
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Operator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
