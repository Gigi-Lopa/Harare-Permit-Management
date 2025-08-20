import { LocalUser, Pagination, Vehicle } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useGetUserInfor from "./useGetUserInfor";

export default function useAdminVehicles(){
    const [user, setUser] = useState<LocalUser | null >(null)
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const router = useRouter()

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
    }, [])

    const getVehicles = (page:  number, token: string | null, filterOption : string) =>{
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles?page=${page}&&status=${filterOption}`, {
            method: "GET",
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(response=>{
            if(response.success){
                setVehicles(response.vehicles)
                setPagination(response.pagination)
            }
        })
        .catch(error=>{
            console.error(error)
            alert("Error fetching vehicles")
        })
    }

    return{
        user,
        vehicles,
        pagination,
        setUser,
        getVehicles
    }

}