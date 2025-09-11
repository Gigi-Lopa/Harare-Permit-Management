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
    route? : string,
    routeFrom? : string,
    routeTo? : string,
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
    operatorName?: string,
    lastInspection? : string
    capacity? : number,
    driverName? : string,
    operatingRoute? : string,
    registrationDate?: string
}
export type VehicleFull = {
  _id:string;
  ownerID: string;
  vehicleId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  engineNumber: string;
  chassisNumber: string;
  color: string;
  fuelType: "petrol" | "diesel" | "electric" | string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string; 
  roadworthyExpiryDate: string;
  operatingRoute: string;
  driverName: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string; 
  status: "pending_approval" | "approved" | "rejected" | string;
  uploadedFiles: UploadedFiles; 
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
};
export type User = {
    _id : string,
    email : string,
    firstName : string,
    lastName : string,
    badgeNumber?: string,
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
    totalApplications? : number,
    totalOperators? : number,
    totalOfficers? : number,
    activePermits? : number,
    registeredVehicles? : number,
    pendingReviews? : number
}
export interface UploadedFiles {
  businessRegistrationCertificate?: string
  vehicleDocuments?: string
  insuranceCertificates?: string
  driversLicenses?: string
}
export interface ApplicationFull {
  _id: string
  applicationId: string
  ownerID: string
  operatorName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  businessRegistration: string
  routeFrom: string
  routeTo: string
  vehicleCount: string
  operatingHours: string
  description: string
  agreedToTerms: string
  status: string
  submittedDate: string
  createdAt: string
  updatedAt: string
  uploadedFiles: UploadedFiles
  timeline: TimelineStep[]
}
export type SearchEntry = {
  id: number
  licensePlate: string
  searchTime: string
  status: string
  operatorName: string
}
export type DeleteDialogState = {
  open: boolean;
  applicationId: string | null;
  operatorName: string | null;
};
export interface Operator {
  _id: string; 
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string; 
  businessInformation: {
    companyName: string;
    businessRegistration: string;
    businessAddress: string;
    contactPerson: string;
  };
  status : string;
  createdAt: string; 
  updatedAt: string; 
  lastLogin?: string; 
  activePermits?: number;
  vehicles?: number;
}
export interface Officer {
  _id: string
  firstName: string
  lastName: string
  email: string
  badgeNumber: string
  department: "traffic_enforcement" | "permit_compliance" | "vehicle_inspection"
  phoneNumber: string
  rank: "officer" | "senior_officer" | "inspector" | "chief_inspector"
  status: "active" | "inactive" | "on_leave"
  createdAt: string 
  updatedAt: string 
}
export interface Violation {
  _id: string
  plate : string
  vehicle_owner: string
  officer_name: string
  violation: string
  fine: string
  date: string
  status: "paid" | "unpaid"
}
