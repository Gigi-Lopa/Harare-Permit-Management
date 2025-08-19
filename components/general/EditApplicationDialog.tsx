import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface props{
    editDialog: {
        open: boolean,
        application: any | null },
    setEditDialog: (dialog: { open: boolean, application: any | null }) => void,
    editFormData: any,
    handleSaveEdit: () => void,
    setEditFormData: (data: any) => void,
}

function EditApplicationDialog({editDialog, setEditDialog,handleSaveEdit, setEditFormData, editFormData}: props) {
  return (
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, application: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
              <DialogDescription>Update application details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="operatorName">Operator Name</Label>
                  <Input
                    id="operatorName"
                    value={editFormData.operatorName || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, operatorName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={editFormData.contactPerson || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="route">Route</Label>
                <Input
                  id="route"
                  value={editFormData.route || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, route: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vehicleCount">Vehicle Count</Label>
                <Input
                  id="vehicleCount"
                  type="number"
                  value={editFormData.vehicleCount || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, vehicleCount: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editFormData.status || ""}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog({ open: false, application: null })}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
    </Dialog>
  )
}

export default EditApplicationDialog