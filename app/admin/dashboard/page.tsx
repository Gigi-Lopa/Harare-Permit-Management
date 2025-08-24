"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bus,
  LogOut
} from "lucide-react"

import useAdmin from "@/hooks/useAdmin"
import AdminCards from "@/components/general/AdminCards"
import Applications from "@/components/tabs/admin/Applications"
import Vehicles from "@/components/tabs/admin/Vehicles"
import Reports from "@/components/tabs/admin/Reports"
import Officers from "@/components/tabs/admin/Officers"
import Operators from "@/components/tabs/admin/Operators"

export default function AdminDashboardPage() {
  const {   
    user,
    stats,
    handleLogout,
    } = useAdmin();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      under_review: "outline",
      rejected: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace("_", " ")}</Badge>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Harare City Council - Permit Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {user.user.firstName ? `${user.user.firstName[0]}${user.user.lastName?.[0] || ""}` : "A"}
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
        {/* Stats Grid */}
       <AdminCards
          totalActiveVehicles={stats?.registeredVehicles ?? 0}
          totalApplications={stats?.totalApplications ?? 0}
          totalPendingReviews={stats.pendingReviews ?? 0}
          totalRegisteredOperators={stats.totalOperators ?? 0}
          totalOfficers={stats.totalOfficers ?? 0}
       />
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>

          </TabsList>

          <Applications getStatusBadge={getStatusBadge}/>
          <Vehicles getStatusBadge={getStatusBadge}/>
          <Operators/>
          <Officers/>
          <Reports/>
        </Tabs>
      </main>
    </div>
  )
}
