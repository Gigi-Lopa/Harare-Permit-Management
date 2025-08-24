import { LocalUser, Pagination, Violation } from "@/types"
import { useEffect, useState } from "react" 
import useGetUserInfor from "./useGetUserInfor"
import { useRouter } from "next/navigation"

export default function useViolations() {
    const [violations, setViolations] = useState<Violation[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [user, setUser] = useState<LocalUser| null>(null)
    const [page, setPage]  = useState(1)
    const router = useRouter();

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
        fetchViolations(user_?.token_payload ?? "");
    }, [page]);
   
    const fetchViolations = async (token:string, ) => {
        try {
            setLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/violations?page=${page}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            })
            if (res.ok) {
                const data = await res.json()
                setViolations(data.violations)
                setPagination(data.pagination)
            } else {
                console.error("Failed to fetch violations")
                alert("Failed to fetch violations")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    const handleMarkPaid = async (id: string) => {
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/violations/${id}/pay`, {
            method: "PATCH",
            headers: {
            Authorization: `Bearer ${user?.token_payload || ""}`,
            },
        })
        if (res.ok) {
            setViolations(prev =>
            prev.map(v =>
                v._id === id ? { ...v, status: "paid" } : v
            )
            )
        } else {
            const errorData = await res.json()
            alert(errorData.error || "Failed to mark as paid")
        }
        } catch (err) {
        console.error(err)
        alert("An error occurred while marking as paid")
        }
    }

    return {
        violations,
        loading,
        pagination,
        page,
        setPage,
        handleMarkPaid ,

    }
}
