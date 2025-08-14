import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"


function Reports() {
  return (
    <TabsContent value="reports">
        <Card>
            <CardHeader>
            <CardTitle>Reports & Analytics</CardTitle>
            <CardDescription>System reports and performance analytics</CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-gray-600">Reports and analytics interface would be implemented here.</p>
            </CardContent>
        </Card>
    </TabsContent>
  )
}

export default Reports