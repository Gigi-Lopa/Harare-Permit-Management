"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bus, Clock,AlertCircle, CheckCircle, Plus, Settings, LogOut, Bell, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useClient from "@/hooks/useClients"
import ClientCards from "@/components/general/ClientCards"
import Applications from "@/components/tabs/client/Applications"
import Vehicles from "@/components/tabs/client/Vehicles"
import Profile from "@/components/tabs/client/Profile"
import TrackApplication from "@/components/general/ClientTrackApplication"

export default function ClientDashboardPage() {
  const {  
    user,
    applications,
    vehicles,
    router,
    fetchUserData,
    handleLogout
  }  = useClient();
  const getStatusIcon = (status: string) => {
        switch (status) {
        case "approved":
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case "under_review":
            return <Clock className="h-4 w-4 text-blue-600" />
        case "rejected":
            return <AlertCircle className="h-4 w-4 text-red-600" />
        default:
            return <Clock className="h-4 w-4 text-gray-600" />
        }
    }
    const getStatusBadge = (status: string) => {
        const variants = {
          pending: "secondary",
          approved: "default",
          under_review: "outline",
          rejected: "destructive",
          active: "default",
          maintenance: "secondary",
        } as const

        return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace("_", " ")}</Badge>
    }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Operator Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.user.firstName || user.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
             
              <Avatar>
                <AvatarFallback>
                  {user.user.firstName ? `${user.user.firstName[0]}${user.user.lastName?.[0] || ""}` : user.user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <ClientCards
          applications ={applications.length}
          activePermits = {4}
          registeredVehicles = {vehicles.length}
          pendingReviews = {4}
        />
        <TrackApplication getStatusBadge = {getStatusBadge} getStatusIcon={getStatusIcon}/>
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <Applications 
            applications={applications}
            getStatusBadge={getStatusBadge}
            getStatusIcon={getStatusIcon}

          />
          <Vehicles
            vehicles={vehicles}
          />
          <Profile user = {{email : "client@client.com", role :"Admin"}}/>
        </Tabs>
      </main>
    </div>
  )
}
