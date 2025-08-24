import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type{ LocalUser } from "@/types";
import useGetUserInfor from "./useGetUserInfor";
export default function useApplication(){
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null)
  const [formData, setFormData] = useState({
    operatorName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    businessRegistration: "",
    routeFrom: "",
    routeTo: "",
    vehicleCount: "",
    operatingHours: "",
    description: "",
    agreedToTerms: false,
    businessRegistrationCertificate: null,
    vehicleDocuments: null,
    insuranceCertificates: null,
    driversLicenses: null,
  })


  const routes = [
    "CBD (Central Business District)",
    "Mbare",
    "Chitungwiza",
    "Kuwadzana", 
    "Budiriro",
    "Glen View",
    "Highfield",
    "Waterfalls",
    "Epworth",
    "Dzivaresekwa",
  ]
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [status, setStatus] = useState({
    error : false,
    success : false
  })
  const businessRegistrationCertificateRef = useRef<HTMLInputElement>(null)
  const vehicleDocumentRef = useRef<HTMLInputElement>(null)
  const insuranceCertificatesRef = useRef<HTMLInputElement>(null)
  const driversLicensesRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {

      setIsLoading(true)
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value as any)
        }
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token_payload}`,
        },
        body: data,
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to submit application")

      setStatus((prev)=> ({...prev, success : true}))
      setTimeout(()=>{
        router.replace("/client/dashboard")
      }, 3500)
    } catch (err) {
      console.error(err)
      setStatus((prev)=> ({...prev, error : true}))
    }
    finally {
      setTimeout(()=>{
        setStatus(()=> ({error : false, success : false}))
      }, 3500)
      setIsLoading(false)
    }
  }
  
  useEffect(()=>{ 
    const user = useGetUserInfor()
    if(user){
      setUser(user);
      getAdminInformation(user)
    } else {
      return router.replace("/")
    }
  }, [])

  const getAdminInformation = (user: LocalUser) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/information`, {
      method : "GET",
      headers : {
        "Authorization" :`Bearer ${user?.token_payload}`
      }
    })
    .then(response => response.json())
    .then(response =>{
      if(response.success){
        handleInputChange("operatorName", response.user.companyName)
        handleInputChange("businessRegistration", response.user.businessRegistration)
        handleInputChange("address", response.user.businessAddress)
      }
    })
    .catch(err => console.log(err))
  }

  return{
    formData,
    isLoading,
    status,
    businessRegistrationCertificateRef,
    insuranceCertificatesRef,
    driversLicensesRef,
    vehicleDocumentRef,
    routes,
    handleInputChange,
    handleSubmit,
    setUser,
  }

}