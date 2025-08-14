import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { Settings,Plus, Bus} from 'lucide-react'
import Link from 'next/link'
import { Vehicle } from '@/types'

interface props{
    vehicles : Vehicle[]
}
function Vehicles({vehicles}:props) {
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
  return (
      <TabsContent value="vehicles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
              <Link href="/client/vehicles/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Vehicle
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {vehicles.map((vehicle: any) => (
                <Card key={vehicle.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Bus className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.registrationNumber}</h3>
                          <p className="text-gray-600">{vehicle.model}</p>
                          <p className="text-sm text-gray-500">Last inspection: {vehicle.lastInspection}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(vehicle.status)}
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
  )
}

export default Vehicles