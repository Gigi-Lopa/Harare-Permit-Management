import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Application } from "@/types"

export default function useAdmin(){
     const [user, setUser] = useState<any>(null)
      const [stats, setStats] = useState({})
      const [applications, setApplications] = useState<Application[]>([])
      const [searchTerm, setSearchTerm] = useState("")
      const [statusFilter, setStatusFilter] = useState("all")
      const router = useRouter()
    
      const [deleteDialog, setDeleteDialog] = useState({ open: false, applicationId: "", operatorName: "" })
      const [editDialog, setEditDialog] = useState({ open: false, application: null })
      const [editFormData, setEditFormData] = useState<any>({})
      const [viewDialog, setViewDialog] = useState({ open: false, application: null })
    
      useEffect(() => {
      /*   // Check if user is logged in and is admin
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")
    
        if (!token || !userData) {
          router.push("/auth/login")
          return
        }
    
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== "admin") {
          router.push("/")
          return
        }
     */
        setUser({
          email :"admin@admin.com",
          firstName : "Admin",
          lastName : "Admin",
          role  :"admin"
        })
        fetchAdminData()
      }, [])
    
      const fetchAdminData = async () => {
        setStats({
          totalApplications: 1247,
          pendingApplications: 89,
          approvedApplications: 1058,
          rejectedApplications: 100,
          totalVehicles: 892,
          activeVehicles: 834,
          totalOperators: 156,
          totalRoutes: 45,
        })
    
        setApplications([
          {
            id: "PRM-2024-001",
            operatorName: "City Express Transport",
            contactPerson: "John Mukamuri",
            route: "CBD - Chitungwiza",
            status: "pending",
            submittedDate: "2024-01-15",
            vehicleCount: 5,
          },
          {
            id: "PRM-2024-002",
            operatorName: "Harare Commuter Services",
            contactPerson: "Mary Chikwanha",
            route: "CBD - Mbare",
            status: "approved",
            submittedDate: "2024-01-12",
            vehicleCount: 8,
          },
          {
            id: "PRM-2024-003",
            operatorName: "Metro Bus Lines",
            contactPerson: "Peter Moyo",
            route: "CBD - Kuwadzana",
            status: "under_review",
            submittedDate: "2024-01-18",
            vehicleCount: 3,
          },
        ])
      }
    
      const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/auth/login")
      }
    
    
      const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
        // In real app, make API call to update status
        setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
        alert(`Application ${applicationId} status updated to ${newStatus}`)
      }
    
      const handleDeleteApplication = async (applicationId: string) => {
        try {
          const response = await fetch(`/api/applications/${applicationId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
    
          if (response.ok) {
            setApplications((prev) => prev.filter((app) => app.id !== applicationId))
            setDeleteDialog({ open: false, applicationId: "", operatorName: "" })
            alert("Application deleted successfully!")
          } else {
            alert("Failed to delete application")
          }
        } catch (error) {
          alert("Error deleting application")
        }
      }
    
      const handleEditApplication = (application: any) => {
        setEditFormData(application)
        setEditDialog({ open: true, application })
      }
    
      const handleSaveEdit = async () => {
        try {
          const response = await fetch(`/api/applications/${editFormData?.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(editFormData),
          })
    
          if (response.ok) {
            //setApplications((prev) => prev.map((app) => (app.id === editFormData.id ? editFormData : app)))
            setEditDialog({ open: false, application: null })
            alert("Application updated successfully!")
          } else {
            alert("Failed to update application")
          }
        } catch (error) {
          alert("Error updating application")
        }
      }
    
      const filteredApplications = applications.filter((app: any) => {
        const matchesSearch =
          app.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || app.status === statusFilter
        return matchesSearch && matchesStatus
      })

      return{
        user,
        stats,
        applications,
        filteredApplications,
        editDialog,
        deleteDialog,
        viewDialog, 
        editFormData,
        searchTerm,
        statusFilter,
        setStatusFilter,
        setSearchTerm,
        setEditFormData,
        setViewDialog,
        setDeleteDialog,
        setEditDialog,
        handleDeleteApplication,
        handleEditApplication,
        handleLogout,
        handleSaveEdit,
        handleUpdateApplicationStatus,
        
      }
}