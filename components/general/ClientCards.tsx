import type { Application } from "@/types"
import { Card, CardContent } from "../ui/card"
import { FileText, Bus, Clock, CheckCircle } from "lucide-react"

interface props {
    applications? : number,
    activePermits? : number,
    registeredVehicles? : number,
    pendingReviews? : number,
}
function ClientCards({applications, activePermits, registeredVehicles, pendingReviews}: props) {

    return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Permits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activePermits}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Registered Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900">{registeredVehicles}</p>
                </div>
                <Bus className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingReviews}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
  )
}

export default ClientCards