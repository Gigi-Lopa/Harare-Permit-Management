import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock,AlertCircle, CheckCircle, Plus, Download } from "lucide-react"
import { Application } from '@/types'

interface props{
    applications : Application[],
    getStatusIcon : (value:string) => React.ReactNode,
    getStatusBadge  : (value: string) => React.ReactNode
}

function Applications({applications, getStatusIcon, getStatusBadge}: props) {
  
  return (
       <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
              <Link href="/client/applications">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {applications.map((app: any) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(app.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{app.id}</h3>
                          <p className="text-gray-600">{app.route}</p>
                          <p className="text-sm text-gray-500">
                            Submitted: {app.submittedDate} • {app.vehicleCount} vehicles
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(app.status)}
                        <Link href={`/track?id=${app.id}`}>
                          <Button variant="outline" size="sm">
                            Track
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
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

export default Applications