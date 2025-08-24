import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useViolations from "@/hooks/useViolations"

function Reports() {
  const {
        violations,
        loading,
        pagination,
        page,
        setPage,
        handleMarkPaid 
    } = useViolations()
    
  return (
    <TabsContent value="reports">
      <Card>
        <CardHeader>
          <CardTitle>Violations</CardTitle>
          <CardDescription>
            Showing {violations.length} of {pagination?.total_items} violations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Loading violations...</p>
          ) : violations.length === 0 ? (
            <p>No violations found</p>
          ) : (
            violations.map(v => (
              <Card key={v._id} className="border rounded-lg shadow-sm">
                <CardHeader>
                  <h6 className="text-md">{v.violation}</h6>
                  <CardDescription className="space-y-1 flex flex-col">
                    <span>Fine: ${v.fine}</span>
                    <span>Date: {v.date}</span> 
                    <span>Vehicle Owner : {v.vehicle_owner}</span>
                    <span>Issued By : {v.officer_name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-sm rounded ${
                      v.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {v.status}
                  </span>
                  {v.status === "unpaid" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMarkPaid(v._id)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
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
        </CardContent>
      </Card>
    </TabsContent>
  )
}

export default Reports
