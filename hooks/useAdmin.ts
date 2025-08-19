import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Application, Pagination, DeleteDialogState, DashboardStats } from "@/types"
import useGetUserInfor from "./useGetUserInfor"
import { toast } from "sonner"

export default function useAdmin(){
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({})
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<Pagination |null>(null)
  const [editDialog, setEditDialog] = useState({ open: false, application: null })
  const [editFormData, setEditFormData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    applicationId: null,
    operatorName: null,
  });  

  useEffect(() => {
    const user = useGetUserInfor()
    if(user){
      setUser(user);
    } else {
      router.replace("/")
      return;
    }

    if (user.user.role !== "admin"){
      router.push("/")
      return
    }
    
    setUser(user)
    getAdminStats(user.token_payload)
  }, [])
  
    const getApplications = (token : string | null, page: number ) =>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications?page=${page}`, {
      method : "GET",
      headers : {
        "Authorization" : `Bearer ${token}`  
      }
    })
    .then(response => response.json())
    .then(response => {
      if (response.success){
        setApplications(response.results)
        setPagination(response.pagination) 
      }
    })
    .catch(error => {
      console.error(error)
      toast.error("An error occured")
    })
  }
  
  const getAdminStats = (token: string) =>{
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
      method : "GET",
      headers : {
        "Authorization" : `Bearer ${token}`  
      }
    })
    .then(response => response.json())
    .then(response=> {
      if (response.success){
        setStats(response.stats)
      }
    })
    .catch(error =>{
      console.log(error)
      toast.error("An error occured fetch dashboard data")
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth/login")
  }

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    // In real app, make API call to update status
  //  setApplications((prev:Application) => prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
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
    //    setApplications((prev) => prev.filter((app) => app.id !== applicationId))
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

  const filteredApplications = applications.filter((app: Application) => {
    
  })

  return{
    user,
    stats,
    router,
    applications,
    filteredApplications,
    editDialog,
    deleteDialog,
    editFormData,
    searchTerm,
    statusFilter,
    pagination,
    getAdminStats,
    setStatusFilter,
    setSearchTerm,
    setEditFormData,
    getApplications,
    setDeleteDialog,
    setEditDialog,
    handleDeleteApplication,
    handleEditApplication,
    handleLogout,
    handleSaveEdit,
    handleUpdateApplicationStatus,
    
  }
}