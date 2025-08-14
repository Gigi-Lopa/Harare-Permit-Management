export type Application = {
    id : string,
    route : string,
    status:  string,
    submittedDate :  string,
    vehicleCount : number,
    operatorName?: string,
    contactPerson?: string,
   
    
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

