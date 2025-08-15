import React, { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Settings, Plus, Bus, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import useVehicles from '@/hooks/useVehicles'

function Vehicles() {
  const { vehicles, getVehicles, pagination } = useVehicles()
  const [page, setPage] = useState(1)

  useEffect(() => {
    getVehicles(page)
  }, [page])

  return (
    <TabsContent value="vehicles" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          My Vehicles ({pagination?.total_items || 0})
        </h2>
        <Link href="/client/vehicles/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register Vehicle
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {Array.isArray(vehicles) && vehicles.map((vehicle: any) => (
          <Card key={vehicle._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Bus className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{vehicle.registrationNumber}</h3>
                    <p className="text-gray-600">{vehicle.make} {vehicle.model}</p>
                    <p className="text-sm text-gray-500">Driver name: {vehicle.driverName}</p>
                    <p className="text-sm text-gray-500">Insurance Company: {vehicle.insuranceCompany}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && (
        <div className='w-full flex flex-row items-center justify-center'>
          <Button
            variant="ghost"
            disabled={!pagination.has_previous}
            onClick={() => setPage(pagination.previous_page || 1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>

          <p className='text-gray-600'>
            {pagination.current_page} / {pagination.total_pages}
          </p>

          <Button
            variant="ghost"
            disabled={!pagination.has_next}
            onClick={() => setPage(pagination.next_page || pagination.total_pages)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </TabsContent>
  )
}

export default Vehicles
