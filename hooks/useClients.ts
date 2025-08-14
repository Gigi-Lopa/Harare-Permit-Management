import type { Application, LocalUser, Vehicle } from "@/types"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import useGetUserInfor from "./useGetUserInfor"

export default function useClient(){
  const [user, setUser] = useState<LocalUser | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [notifications, setNotifications] = useState([])
  const router = useRouter()    

  useEffect(() => {
     const user = useGetUserInfor()
        if(user){
          setUser(user);
        } else {
          router.replace("/")
        }
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setApplications([
      {
        id: "PRM-2024-001",
        route: "CBD - Chitungwiza",
        status: "under_review",
        submittedDate: "2024-01-15",
        vehicleCount: 5,
      },
      {
        id: "PRM-2024-005",
        route: "CBD - Glen View",
        status: "approved",
        submittedDate: "2024-01-08",
        vehicleCount: 3,
      },
    ])

    setVehicles([
      {
        id: "VEH-001",
        registrationNumber: "AEZ 1234",
        model: "Toyota Hiace",
        status: "active",
        lastInspection: "2024-01-01",
      },
      {
        id: "VEH-002",
        registrationNumber: "AEZ 5678",
        model: "Nissan Caravan",
        status: "maintenance",
        lastInspection: "2023-12-15",
      },
    ])
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return {
    notifications,
    user,
    applications,
    vehicles,
    router,
    fetchUserData,
    handleLogout
  }
}