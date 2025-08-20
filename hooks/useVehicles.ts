"use client"

import type React from "react"

import { useRef, useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { LocalUser, Pagination, Vehicle } from "@/types"
import useGetUserInfor from "@/hooks/useGetUserInfor"
import Operators from "@/components/tabs/admin/Operators"

export default function useVehicles(){
  const [user, setUser] = useState<LocalUser | null>(null)
  const [formData, setFormData] = useState({
    registrationNumber: "",
    make: "",
    model: "",
    year: "",
    capacity: "",
    engineNumber: "",
    chassisNumber: "",
    color: "",
    fuelType: "diesel",
    insuranceCompany: "",
    insurancePolicyNumber: "",
    insuranceExpiryDate: "",
    roadworthyExpiryDate: "",
    operatingRoute: "",
    driverName: "",
    driverLicenseNumber: "",
    driverLicenseExpiry: "",
    agreeToTerms: false,
    vehicleDocuments: null,
    insuranceCertificates: null,  
    driversLicenses: null,
    ownerID: "",
  })
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [operator, setOperator] = useState("")
  const [getVehiclesStatus, setGetVehiclesStatus] = useState({
    loading : true,
    error : false,
    empty : false
  })
  const vehicleMakes = [
    "Toyota",
    "Nissan",
    "Isuzu",
    "Mercedes-Benz",
    "Volkswagen",
    "Ford",
    "Mitsubishi",
    "Hyundai",
    "Other",
  ]

  const routes = [
    "CBD - Chitungwiza",
    "CBD - Mbare",
    "CBD - Kuwadzana",
    "CBD - Budiriro",
    "CBD - Glen View",
    "CBD - Highfield",
    "CBD - Waterfalls",
    "CBD - Epworth",
    "CBD - Dzivaresekwa",
  ]

  const driversLicensesRef = useRef<HTMLInputElement>(null)
  const vehicleRegistrationCertificateRef =  useRef<HTMLInputElement>(null)
  const insuranceCertificatesRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            fd.append(key, typeof value === "boolean" ? String(value) : value as string | Blob);
        }
        });

        if (formData.vehicleDocuments) {
         fd.append("vehicleDocuments", formData.vehicleDocuments);
        }
        if (formData.insuranceCertificates) {
         fd.append("insuranceCertificates", formData.insuranceCertificates);
        }
        if (formData.driversLicenses) {
         fd.append("driversLicenses", formData.driversLicenses);
        }

        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/register`,
        {
            method: "POST",
            headers: {
            Authorization: `Bearer ${user?.token_payload}`,
            },
            body: fd,
        }
        );

        const data = await response.json();

        if (response.ok) {
        setSuccess(
            "Vehicle registered successfully! It will be reviewed by the authorities."
        );
        setTimeout(() => {
            router.push("/client/dashboard");
        }, 3000);
        } else {
         setError(data.error || "Vehicle registration failed");
        }
    } catch (err) {
        setError("Network error. Please try again.");
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    const user = useGetUserInfor()
      if(user){
        setUser(user);
      } else {
        router.replace("/")
      }
   }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getVehicles = (page: number) => {
    const user_ = user ? user : useGetUserInfor()
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles?page=${page}`,{
        method : "GET",
        headers : {
            "Authorization" : `Bearer ${user_?.token_payload}`
        }
    })
    .then(response => response.json())
    .then(response => {
        if(response.success){
            setVehicles(response.results)
            setGetVehiclesStatus(prev => ({
            ...prev,
            empty: !response.results || response.results.length === 0
            }));
            setPagination(response.pagination)
            return;
        }
    })
    .catch(error =>{
        console.log(error)
        setGetVehiclesStatus((prev)=>({...prev, error : false}))
    })
    .finally(()=>setGetVehiclesStatus((prev)=> ({...prev, loading : false})))
  }

  return{
    user,
    formData,
    loading,
    error,
    success,
    vehicleMakes,
    routes,
    driversLicensesRef,
    vehicleRegistrationCertificateRef, 
    insuranceCertificatesRef,
    vehicles,
    pagination,
    getVehiclesStatus,
    operator,
    setOperator,
    getVehicles,
    handleSubmit,
    handleInputChange 
  }


}