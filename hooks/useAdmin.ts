import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Application, Pagination, DeleteDialogState, DashboardStats, LocalUser } from "@/types"
import useGetUserInfor from "./useGetUserInfor"
import { toast } from "sonner"

export default function useAdmin(){
  const [user, setUser] = useState<LocalUser | null>(null)
  const [stats, setStats] = useState<DashboardStats>({})
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<Pagination |null>(null)
  const [editDialog, setEditDialog] = useState({ open: false, application: null })
  const [editFormData, setEditFormData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState("")
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

    if (user.user.role === "admin"){
      setUser(user)
      getAdminStats(user.token_payload)
    }
    
  
  }, [])
  
    const getApplications = (token : string | null, page: number, status :string ) =>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/applications?page=${page}&&status=${status}`, {
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

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/application/${editFormData?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token_payload ?? ""}`,
        },
        body: JSON.stringify(editFormData),
      })
      const data = response.json()
      if (response.ok) {
        setEditDialog({ open: false, application: null })
        toast.success("Application updated successfully!")
        location.reload()
      } else {
        alert( "Failed to update application")
      }
    } catch (error) {
      alert("Error updating application")
    }
  }


  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/application/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token_payload}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Status updated to ${newStatus}`);
        
        if(applications.length !=0){
          setApplications((prev) =>
            prev.map((app) =>
              app.id === applicationId ? { ...app, status: newStatus } : app
            )
          );
        } else {
          location.reload()
        }
       
      } else {
        const err = await response.json();
        console.log(err)
        toast.error(err.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong while updating status");
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token_payload}`,
        },
      })

      if (response.ok) {
        if(applications.length !=0){
          setApplications((prev) => prev.filter((app) => app.applicationId !== applicationId)) 
        } else {
          router.replace("/admin/dashboard")
          return;
        }
       
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

  const handleSearch = async (searchItem: string) => {
    try {
      if (!searchItem.trim()) {return}
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/s/applications?applicationId=${encodeURIComponent(searchItem)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token_payload}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setApplications(Array.isArray(data) ? data : [])
      } else {
        setApplications([])
      }
    } catch (error) {
      console.error("Error searching applications:", error)
      setApplications([])
    }
  }

  return{
    user,
    stats,
    router,
    applications,
    editDialog,
    deleteDialog,
    editFormData,
    searchTerm,
    pagination,
    getAdminStats,
    setSearchTerm,
    setEditFormData,
    getApplications,
    setDeleteDialog,
    setEditDialog,
    handleDeleteApplication,
    handleEditApplication,
    handleLogout,
    handleSaveEdit,
    handleSearch,
    handleUpdateApplicationStatus,
    
  }
}