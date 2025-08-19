import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Trash2 } from "lucide-react"
import { Application, DeleteDialogState } from "@/types"

interface props {
    deleteDialog : DeleteDialogState,
    application: Application,
    setDeleteDialog: React.Dispatch<React.SetStateAction<DeleteDialogState>>;
    handleDeleteApplication: (id: string ) => void;
}
function DeleteApplicationDialog({deleteDialog, application, setDeleteDialog, handleDeleteApplication}:props) {
  return (
     <Dialog
        open={deleteDialog.open && deleteDialog.applicationId === application.id}
        onOpenChange={(open) =>
        setDeleteDialog({ open, applicationId: application.id, operatorName: application.operatorName ?? "" })
        }
        >
        <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600">
                <Trash2 className="h-4 w-4" />
            </Button>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
            Are you sure you want to delete application {application.applicationId} from {application.operatorName}? This
            action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button
            variant="outline"
            onClick={() =>
                setDeleteDialog({ open: false, applicationId: "", operatorName: "" })
            }
            >
            Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteApplication(application.id)}>
            Delete
            </Button>
        </DialogFooter>
        </DialogContent>
        </Dialog>

  )
}

export default DeleteApplicationDialog