import { LocalUser, Pagination, Vehicle, VehicleFull } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useGetUserInfor from "./useGetUserInfor";
import useDebounce from "./useDebounce";

export default function useAdminVehicles(){
    const [user, setUser] = useState<LocalUser | null >(null)
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleFull | null>(null)
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [openEditVehicle, setOpenEditVehicle] = useState(false)
    const [page, setPage] = useState(1)
    const [filterOption, setFilterOption] = useState("default")
    
    const debounceSearch = useDebounce(searchValue, 500) 
    
    const router = useRouter()

    useEffect(() => {
    const user = useGetUserInfor()

    if (!user) {
        router.replace("/")
        return
    }

    setUser(user)

    if (user.user.role !== "admin") {
        router.push("/")
        return
    }

    getVehicles(page, user?.token_payload ?? null, filterOption)
    }, [page, filterOption, debounceSearch])

    const getVehicles = (page:  number, token: string | null, filterOption : string) =>{
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicles?page=${page}&&status=${filterOption}${debounceSearch.trim().length != 0 ? `&&search=${debounceSearch.trim()}` : ""}`, {
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

    const fetchVehicleDetails = async (vehicleId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/vehicle/${vehicleId}`, {
                headers: {
                "Authorization": `Bearer ${user?.token_payload}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setSelectedVehicle(data.vehicle)
            }
        } catch (err) {
            console.error("Error fetching vehicle:", err)
        }
    }

    return{
        user,
        vehicles,
        pagination,
        selectedVehicle,
        open,
        openEditVehicle,
        searchValue,
        debounceSearch, 
        filterOption,
        page,
        setFilterOption, 
        setPage,
        setSearchValue,
        setOpenEditVehicle,
        fetchVehicleDetails,
        setOpen,
        setUser,
        getVehicles
    }

}