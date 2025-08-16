export type TimelineStep = {
  status: string
  date: string
  time: string
  description: string
  completed: boolean
  current?: boolean
}

export type Application = {
    id : string,
    route : string,
    status:  string,
    applicationId : string,
    submittedDate :  string,
    vehicleCount : number,
    operatorName?: string,
    contactPerson?: string,
    timeline?: TimelineStep[]   
}

export type Vehicle = {
    id : string,
    registrationNumber : string,
    model : string,
    status : string,
    lastInspection : string
}

export type User = {
    _id : string,
    email : string,
    firstName : string,
    lastName : string,
    role : string
}

export type LocalUser = {
    user : User,
    token_payload : string
}

export type Pagination ={
    current_page: number,
    total_pages: number,
    total_items: number,
    has_previous: boolean,
    has_next: boolean,
    previous_page: number,
    next_page: number
}

export type DashboardStats = {
    totalApplications : number,
    activePermits : number,
    registeredVehicles : number,
    pendingReviews : number
}

