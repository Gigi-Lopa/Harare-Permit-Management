import { Application, LocalUser } from "@/types"
import { useState } from "react"
import useGetUserInfor from "./useGetUserInfor"
import { count } from "console"


export default function useTrackApplication(){
  const [applicationId, setApplicationId] = useState("")
  const [applications, setApplications] = useState<Application[] | null>(null)  
  const [applicationData, setApplicationData] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<LocalUser | null>(useGetUserInfor())

const handleSearch = async ( mode: "default" | "single", quickTrack?: string | null ) => {
    if (!applicationId.trim()) return
    setLoading(true)
    
      const QUERY = mode === "default" ? `${process.env.NEXT_PUBLIC_API_URL}/api/client/search/application?q=${applicationId}` :
      `${process.env.NEXT_PUBLIC_API_URL}/api/client/search/application?q=${quickTrack ? quickTrack : applicationId}&&mode=single`
      fetch(QUERY,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token_payload}`,
          }
      })
      .then(response => response.json())
      .then(response =>{
        if(response.success){
          if(mode === "single"){
            setApplicationData(response.result)
            return;
          }

          setApplications(response.results)
        }
      })
      .catch(error=> console.log(error))
      .finally(()=>setLoading(false))

  }

  const onClear = () =>{
    setApplicationId("")
    setApplicationData(null)
    setApplications(null)
  }

  return {
    applicationId,
    applicationData,
    loading,
    applications,
    onClear,
    setApplicationData,
    setApplicationId,
    handleSearch
  }

}