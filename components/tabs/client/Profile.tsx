import React, {useEffect, useState} from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { LocalUser } from '@/types'
import useGetUserInfor from '@/hooks/useGetUserInfor'


function Profile() {
  const [user, setUser] = useState<LocalUser | null>(null)
  useEffect(() => {
    setUser(useGetUserInfor())
  }, [])
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
            <p className="text-sm font-medium text-gray-600">Name</p>
            <p className="text-lg">{user?.user.firstName} {user?.user.lastName} </p>
            </div>
            <div>
            <p className="text-sm font-medium text-gray-600">Email</p>
            <p className="text-lg">{user?.user.email}</p>
            </div>
            <div>
            <p className="text-sm font-medium text-gray-600">Account Type</p>
            <p className="text-lg capitalize">{user?.user.role}</p>
            </div>
        </div>
       
        </CardContent>
    </Card>
    </TabsContent>
  )
}

export default Profile