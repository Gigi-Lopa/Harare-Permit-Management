import React, { useEffect, useState } from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, Plus , ChevronLeft, ChevronRight, ExternalLink} from "lucide-react"
import { Application } from '@/types'
import useClient from '@/hooks/useClients'
import LoadingIndicator from '@/components/general/LoadingIndicators'
import { Alert, AlertDescription } from "@/components/ui/alert"
import EmptyScreen from '@/components/general/EmptyScreen'

interface props{
    getStatusIcon : (value:string) => React.ReactNode,
    getStatusBadge  : (value: string) => React.ReactNode,
    setApplicationId : (value:string) => void,
    handleSearch : (value: "default" | "single") => void
}

function Applications({ getStatusIcon ,getStatusBadge, setApplicationId, handleSearch}: props) {
  const {    
  applications,
  pagination,
  getApplicationsStatus,
  getUserApplications} =useClient() 
  const [page, setPage] = useState(1)

  useEffect(()=>{
    if(applications.length === 0){
      getUserApplications(page)
    }
  }, [page])

  return (
       <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
              <Link href="/client/applications/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>
            {
              getApplicationsStatus.loading &&
              <div className='h-[50vh] flex flex-col items-center justify-center'>
                <LoadingIndicator/>
              </div>
            }
            {
              getApplicationsStatus.empty &&
              <EmptyScreen message='Empty Applications'/>
            }

            { getApplicationsStatus.error &&
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>An error occured</AlertDescription>
                </Alert>
            }
            <div className="grid gap-6">
              {applications.map((app: Application, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(app.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{app.applicationId}</h3>
                          <p className="text-gray-600">{app.route}</p>
                          <p className="text-sm text-gray-500">
                            Submitted: {app.submittedDate} • {app.vehicleCount} vehicles
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(app.status)}
                          <Button variant="outline" size="sm" onClick={()=>{
                            setApplicationId(app.applicationId);
                            handleSearch("single")
                          }}>
                            Track
                          </Button>
                          <Link href={"/uni/application?id=" + app.applicationId}>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
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

export default Applications