import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface props{
    user : {
        email? : string,
        role? : string ,
        id? : string,
        firstName? : string,
        lastName? : string
    }
}

function Profile({user} : props) {
  return ( 
  <TabsContent value="profile" className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

    <Card>
        <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Manage your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-lg">{user.email}</p>
            </div>
            <div>
            <p className="text-sm font-medium text-gray-600">Account Type</p>
            <p className="text-lg capitalize">{user.role}</p>
            </div>
        </div>
        <div className="pt-4">
            <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
            </Button>
        </div>
        </CardContent>
    </Card>
    </TabsContent>
  )
}

export default Profile