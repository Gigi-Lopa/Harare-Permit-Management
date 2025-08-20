import type { Application, DashboardStats, LocalUser, Pagination } from "@/types"
import { useRouter } from "next/navigation"
import { useState, useEffect, use } from "react"
import useGetUserInfor from "./useGetUserInfor"

export default function useClient(){
  const [user, setUser] = useState<LocalUser | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalApplications : 0,
    activePermits : 0,
    registeredVehicles : 0,
    pendingReviews : 0
  })

  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [getApplicationsStatus, setGetApplicationStatus] = useState({
    loading : true,
    error : false,
    empty : false
  })

  const router = useRouter()    

  useEffect(() => {
     const user = useGetUserInfor()
        if(user){
          setUser(user);
        } else {
          router.replace("/")
        return;
        }
    getDashbaord(user?.token_payload || "")
  }, [])

  const getUserApplications = async (page: number) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications?page=${page}`, {
        method : "GET",
        headers  :{
          "Authorization" : useGetUserInfor()?.token_payload || ""
        }
      })
      .then(response => response.json())
      .then(response => {
        if(response.success){
            setApplications(response.results)
            setGetApplicationStatus(prev => ({
            ...prev,
            empty: !response.results || response.results.length === 0
            }));
            setPagination(response.pagination)
            
            return;
        }
    })
    .catch(error =>{
        console.log(error)
        setGetApplicationStatus((prev)=>({...prev, error : false}))
    })
    .finally(()=>setGetApplicationStatus((prev)=> ({...prev, loading : false})))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  } 

  const getDashbaord = (token: string) =>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/client/dashboard`, {
      method : "GET",
      headers  :{
        "Authorization" : token
      }
    })
    .then(response => response.json())
    .then(response => {
      if(response.success){
        setDashboardStats(response.stats)
      }
    })
  }

  return {
    notifications,
    user,
    applications,
    router,
    dashboardStats,
    pagination,
    getApplicationsStatus,
    getUserApplications,
    handleLogout
  }
}