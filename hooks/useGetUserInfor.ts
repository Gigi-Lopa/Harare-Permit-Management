import { LocalUser } from "@/types";

export default function useGetUserInfor() {
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const parsedToken = JSON.parse(token);
            const user = parsedToken?.user;
        
            return {
                user :{
                    _id: user?._id,
                    email: user?.email,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    companyName : user?.companyName,
                    badgeNumber : user?.badgeNumber || "N/A",
                    role: user?.role,
                },
                token_payload: parsedToken?.token_payload
            } as LocalUser;
        } catch (error) {
            console.error("Failed to parse token:", error);
            return null;
        }
    }
    return null;
}