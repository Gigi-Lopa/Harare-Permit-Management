import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import useOfficers from '@/hooks/useAdminOfficers'
import AddOfficerDialog from '@/components/general/AddOfficerDialog'
import ViewOfficerDialog from '@/components/general/ViewOfficerDialog'
import UpdateOfficerDialog from '@/components/general/UpdateOfficerDialog'
import DeleteOfficerDialog from '@/components/general/DeleteOfficerDialog'
import EmptyScreen from '@/components/general/EmptyScreen'

function Officers() {
    const {
        officers,
        page,
        filterOptions,
        user,
        searchValue,
        pagination,
        setSearchValue,
        getOfficers,
        setFilterOptions,
        setPage
    } = useOfficers();
  return (
    <TabsContent value="officers" className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Traffic Officers</h2>
            <AddOfficerDialog onAddOfficer={()=> getOfficers(user?.token_payload || "", page, filterOptions)}/>
        </div>
        <Card>
            <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                        placeholder="Search officers..."
                        className="pl-10"
                        value={searchValue}
                        onChange={(e)=>setSearchValue(e.target.value)} 
                    />
                </div>
                </div>
                <Select defaultValue={filterOptions} onValueChange={(val)=> setFilterOptions(val)}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Suspended</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Badge Number</TableHead>
                    <TableHead>Officer Name</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {officers &&
                officers
                .map((officer) => (
                    <TableRow key={officer._id}>
                    <TableCell className="font-medium font-mono">{officer.badgeNumber}</TableCell>
                    <TableCell>
                        <div>
                        <p className="font-medium">
                            {officer.firstName} {officer.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Joined: {officer.createdAt}</p>
                        </div>
                    </TableCell>
                    <TableCell>{officer.rank.replace("_", " ")}</TableCell>
                    <TableCell>{officer.department.replace("_", " ").toWellFormed()}</TableCell>
                    <TableCell>{officer.email}</TableCell>
                    <TableCell>{officer.phoneNumber}</TableCell>
                    <TableCell>
                        <Badge
                        variant={
                            officer.status === "active"
                            ? "default"
                            : officer.status === "on_leave"
                                ? "secondary"
                                : "destructive"
                        }
                        >
                        {officer.status.replace("_", " ")}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex space-x-2">
                            <ViewOfficerDialog officer={officer}/>
                            <UpdateOfficerDialog officer={officer} 
                                onUpdate = {()=>getOfficers(user?.token_payload || "", page, filterOptions)}/>
                            <DeleteOfficerDialog officer={officer}
                                onDelete = {()=>getOfficers(user?.token_payload || "", page, filterOptions)}/>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                {
                    officers &&
                    officers.length === 0 &&
                    <TableRow>
                        <TableCell colSpan={8}>
                        <EmptyScreen message='No registered officers'></EmptyScreen>
                        </TableCell>
                    </TableRow>
                }
                </TableBody>
            </Table>
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

export default Officers