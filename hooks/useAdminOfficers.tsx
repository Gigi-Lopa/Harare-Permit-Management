import { LocalUser, Officer, Pagination } from "@/types"
import { useState, useEffect } from "react"
import useGetUserInfor from "./useGetUserInfor"
import { useRouter } from "next/navigation"
import useDebounce from "./useDebounce"

export default function useOfficers(){
    const [officers, setOfficers] = useState<Officer[] | null>(null)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [filterOptions, setFilterOptions] = useState("default")
    const [user, setUser] = useState<LocalUser | null>(null)
    const [searchValue, setSearchValue] = useState("")
    const [page, setPage] = useState(1)
    const debounceSearch = useDebounce(searchValue,500)
    const router  = useRouter();

     useEffect(() => {
        const user_ = useGetUserInfor();

        if (!user_) {
            return router.replace("/");
        }
        
        if (user_.user.role !== "admin") {
        router.push("/")
        return
        }
        
        setUser(user_);
        getOfficers(user_?.token_payload ?? "", page, filterOptions);
    }, [page, filterOptions, debounceSearch]);
    
    function getOfficers(token:string, page:number, filterOptions:string){
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/officers?page=${page}&&status=${filterOptions}${debounceSearch.trim().length != 0 ? `&&search=${debounceSearch.trim()}` : ""}`, {
            method: "GET",
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(response=>{
            if(response.success){
                setOfficers(response.officers)
                setPagination(response.pagination)
            }
        })
        .catch(error=>{
            console.error(error)
            alert("Error fetching officers")
        })
    }

    return {
        officers,
        page,
        filterOptions,
        user,
        searchValue,
        pagination,
        setSearchValue,
        getOfficers,
        setFilterOptions,
        setPage,
    }
}