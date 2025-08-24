import { LocalUser, Operator, Pagination } from "@/types"
import { useState, useEffect } from "react"
import useGetUserInfor from "./useGetUserInfor"
import { useRouter } from "next/navigation"
import useDebounce from "./useDebounce"
export default function useOperators(){
    const [operators, setOperators] = useState<Operator[] | null>(null)
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
        getOperators(user_?.token_payload ?? "", page, filterOptions);
    }, [page, filterOptions, debounceSearch]);

    function getOperators(token: string, page:number, filterOptions:string){
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/operators?page=${page}&&status=${filterOptions}${debounceSearch.trim().length != 0 ? `&&search=${debounceSearch.trim()}` : ""}`, {
            method: "GET",
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(response=>{
            if(response.success){
                setOperators(response.operators)
                setPagination(response.pagination)
            }
        })
        .catch(error=>{
            console.error(error)
            alert("Error fetching operators")
        })
    }
    
    return {
        operators,
        pagination,
        page,
        filterOptions,
        setFilterOptions,
        setPage,
        user,
        getOperators,   
        searchValue,
        setSearchValue,

    }
}