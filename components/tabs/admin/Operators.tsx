import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import {
    ChevronLeft,
  ChevronRight,
  Search
} from "lucide-react"

import AddOperatorDialog from '@/components/general/AddOperatorDialog'
import ViewOperatorDialog from '@/components/general/ViewOperatorDialog'
import UpdateOperatorDialog from '@/components/general/UpdateOperatorDialog'
import DeleteOperatorDialog from '@/components/general/DeleteOperatorDialog'
import useOperators from '@/hooks/useOperators'
import EmptyScreen from '@/components/general/EmptyScreen'


function Operators() {
    const {
        operators,
        pagination, 
        searchValue,
        filterOptions,
        page, 
        user,
        setPage,
        setSearchValue,
        getOperators,
        setFilterOptions
    } = useOperators()
  return (
     <TabsContent value="operators">
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Transport Operators</h2>
                <AddOperatorDialog onAddOperator = {()=> getOperators(user?.token_payload || "", page, filterOptions)}/>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input 
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    placeholder="Search operators..."
                                    className="pl-10" />
                            </div>
                        </div>
                        <Select defaultValue= {filterOptions} onValueChange={(val)=> setFilterOptions(val)}>
                            <SelectTrigger className="w-48">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Operator Name</TableHead>
                            <TableHead>Account Handler</TableHead>
                            <TableHead>Handler Email</TableHead>
                            <TableHead>Handler Phone</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Active Permits</TableHead>
                            <TableHead>Vehicles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {operators &&
                           operators
                            .map((operator) => (
                            <TableRow key={operator._id}>
                                <TableCell className="font-medium">{operator.businessInformation.companyName}</TableCell>
                                <TableCell>{operator.firstName} {operator.lastName}</TableCell>
                                <TableCell>{operator.email}</TableCell>
                                <TableCell>{operator.phone}</TableCell>
                                <TableCell>{operator.businessInformation.contactPerson}</TableCell>
                                <TableCell>{operator.activePermits}</TableCell>
                                <TableCell>{operator.vehicles}</TableCell>
                                <TableCell>
                                <Badge
                                    variant={
                                    operator.status === "active"
                                        ? "default"
                                        : operator.status === "suspended"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                >
                                    {operator.status}
                                </Badge>
                                </TableCell>
                                <TableCell>
                                <div className="flex space-x-2">
                                    <ViewOperatorDialog operator={operator}/>
                                    <UpdateOperatorDialog operator={operator} onUpdate = {()=>{
                                        location.reload() // I KNOW ITS DUMB BUT I HAD TO RELOAD THE ENTIRE TABS CAUSE OF DATA ENHERITANCE
                                    }}/>
                                    <DeleteOperatorDialog operator={operator} onDelete={()=> location.reload()}/>
                                </div>
                                </TableCell>
                            </TableRow>
                            ))}
                            {
                                operators &&
                                operators.length === 0 &&
                                <TableRow>
                                 <TableCell colSpan={9}>
                                    <EmptyScreen message='No registered Operators'></EmptyScreen>
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
        </div>
    </TabsContent>
  )
}

export default Operators