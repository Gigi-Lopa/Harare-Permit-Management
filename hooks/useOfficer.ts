
import { useRouter } from "next/navigation"
import { LocalUser, SearchEntry } from "@/types"
import { useState, useEffect } from "react"

export default function useOfficer(){
     const [user, setUser] = useState<LocalUser | null>(null)
  const [searchPlate, setSearchPlate] = useState("")
  const [vehicleInfo, setVehicleInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchHistory, setSearchHistory] = useState<SearchEntry[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      router.push("/auth/officer")
      return
    }

    const parsedUser = JSON.parse(token)
    if (parsedUser.user.role !== "officer") {
      router.push("/auth/officer")
      return
    } 
    setUser(parsedUser)
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem("history") || "[]")
    setSearchHistory(history.slice(0, 5)) 
  }
  
  const handleSearch = async () => {
    if (!searchPlate.trim()) {
      setError("Please enter a license plate number")
      return
    }

    setLoading(true)
    setError("")
    setVehicleInfo(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/officer/search?plate=${encodeURIComponent(searchPlate)}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token_payload}`,
          },
        }
      )

      if (!response.ok) {
        const errData = await response.json()
        setError(errData.error || "Vehicle Not found")
        return
      }

      const vehicleData = await response.json()
      setVehicleInfo(vehicleData)

      const newSearch = {
        id: Date.now(),
        licensePlate: vehicleData.licensePlate,
        searchTime: new Date().toLocaleString(),
        status: vehicleData.status,
        operatorName: vehicleData.operatorName,
      }

      setSearchHistory((prev) => {
        const updated = [newSearch, ...prev.filter((s:SearchEntry) => s.licensePlate !== newSearch.licensePlate)]
        return updated.slice(0, 5)
      })

      const existingHistory = JSON.parse(localStorage.getItem("history") || "[]")
      const updatedHistory = [newSearch, ...existingHistory.filter((s:SearchEntry) => s.licensePlate !== newSearch.licensePlate)]
      localStorage.setItem("history", JSON.stringify(updatedHistory.slice(0, 5)))
      
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }
  const AddViolation = (violation: any) => {
    setVehicleInfo((prev: any) => ({
      ...prev,
      violations: [...(prev.violations || []), violation], 
    }))
  }


  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth/officer")
  }

    return{
        user,
        searchPlate,
        vehicleInfo,
        loading,
        error,
        searchHistory,
        handleSearch,
        AddViolation,
        handleLogout,
        setSearchPlate
    }
}