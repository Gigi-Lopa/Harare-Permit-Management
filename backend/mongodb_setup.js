// MongoDB setup script for the Permit Management System
// Run this in MongoDB shell or MongoDB Compass

// Create database
const permit_management = db.getSiblingDB("permit_management")
use(permit_management)

// Create collections with validation schemas

// Applications collection
permit_management.createCollection("applications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["applicationId", "operatorName", "contactPerson", "email", "phone", "routeFrom", "routeTo", "status"],
      properties: {
        applicationId: {
          bsonType: "string",
          pattern: "^PRM-[0-9]{4}-[0-9]{3}$",
          description: "Application ID must be in format PRM-YYYY-XXX",
        },
        operatorName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
          description: "Operator name must be between 2 and 100 characters",
        },
        contactPerson: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50,
          description: "Contact person name must be between 2 and 50 characters",
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address",
        },
        phone: {
          bsonType: "string",
          description: "Phone number is required",
        },
        status: {
          bsonType: "string",
          enum: ["pending", "under_review", "approved", "rejected"],
          description: "Status must be one of: pending, under_review, approved, rejected",
        },
        vehicleCount: {
          bsonType: "int",
          minimum: 1,
          description: "Vehicle count must be at least 1",
        },
      },
    },
  },
})

// Vehicles collection
permit_management.createCollection("vehicles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["registrationNumber", "operatorName", "model", "capacity", "status"],
      properties: {
        registrationNumber: {
          bsonType: "string",
          pattern: "^[A-Z]{3} [0-9]{4}$",
          description: "Registration number must be in format ABC 1234",
        },
        capacity: {
          bsonType: "int",
          minimum: 10,
          maximum: 30,
          description: "Vehicle capacity must be between 10 and 30 passengers",
        },
        status: {
          bsonType: "string",
          enum: ["active", "maintenance", "retired"],
          description: "Status must be one of: active, maintenance, retired",
        },
      },
    },
  },
})

// Operators collection
permit_management.createCollection("operators", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["operatorName", "contactPerson", "email", "phone", "businessRegistration"],
      properties: {
        operatorName: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100,
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
      },
    },
  },
})

// Routes collection
permit_management.createCollection("routes", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["routeId", "fromLocation", "toLocation", "distance", "estimatedTime"],
      properties: {
        routeId: {
          bsonType: "string",
          pattern: "^RT-[0-9]{3}$",
        },
        distance: {
          bsonType: "double",
          minimum: 0,
        },
        estimatedTime: {
          bsonType: "int",
          minimum: 1,
        },
      },
    },
  },
})

// Users collection for authentication
permit_management.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
        role: {
          bsonType: "string",
          enum: ["admin", "operator", "inspector"],
          description: "Role must be one of: admin, operator, inspector",
        },
      },
    },
  },
})

// Create indexes for better performance
permit_management.applications.createIndex({ applicationId: 1 }, { unique: true })
permit_management.applications.createIndex({ status: 1 })
permit_management.applications.createIndex({ operatorName: 1 })
permit_management.applications.createIndex({ submittedDate: -1 })

permit_management.vehicles.createIndex({ registrationNumber: 1 }, { unique: true })
permit_management.vehicles.createIndex({ operatorName: 1 })
permit_management.vehicles.createIndex({ status: 1 })

permit_management.operators.createIndex({ operatorName: 1 }, { unique: true })
permit_management.operators.createIndex({ email: 1 }, { unique: true })
permit_management.operators.createIndex({ businessRegistration: 1 }, { unique: true })

permit_management.routes.createIndex({ routeId: 1 }, { unique: true })
permit_management.routes.createIndex({ fromLocation: 1, toLocation: 1 })

permit_management.users.createIndex({ email: 1 }, { unique: true })

// Insert sample data

// Sample routes
permit_management.routes.insertMany([
  {
    routeId: "RT-001",
    fromLocation: "CBD (Central Business District)",
    toLocation: "Chitungwiza",
    distance: 25.5,
    estimatedTime: 45,
    fare: 2.5,
    status: "active",
    createdAt: new Date(),
  },
  {
    routeId: "RT-002",
    fromLocation: "CBD (Central Business District)",
    toLocation: "Mbare",
    distance: 8.2,
    estimatedTime: 20,
    fare: 1.5,
    status: "active",
    createdAt: new Date(),
  },
  {
    routeId: "RT-003",
    fromLocation: "CBD (Central Business District)",
    toLocation: "Kuwadzana",
    distance: 18.7,
    estimatedTime: 35,
    fare: 2.0,
    status: "active",
    createdAt: new Date(),
  },
  {
    routeId: "RT-004",
    fromLocation: "CBD (Central Business District)",
    toLocation: "Budiriro",
    distance: 22.3,
    estimatedTime: 40,
    fare: 2.25,
    status: "active",
    createdAt: new Date(),
  },
  {
    routeId: "RT-005",
    fromLocation: "CBD (Central Business District)",
    toLocation: "Glen View",
    distance: 15.1,
    estimatedTime: 30,
    fare: 1.75,
    status: "active",
    createdAt: new Date(),
  },
])

// Sample operators
permit_management.operators.insertMany([
  {
    operatorName: "City Express Transport",
    contactPerson: "John Mukamuri",
    email: "john@cityexpress.co.zw",
    phone: "+263 77 123 4567",
    address: "123 Samora Machel Avenue, Harare",
    businessRegistration: "BR-2020-001",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    operatorName: "Harare Commuter Services",
    contactPerson: "Mary Chikwanha",
    email: "mary@hcs.co.zw",
    phone: "+263 77 234 5678",
    address: "456 Robert Mugabe Road, Harare",
    businessRegistration: "BR-2019-045",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    operatorName: "Metro Bus Lines",
    contactPerson: "Peter Moyo",
    email: "peter@metrobus.co.zw",
    phone: "+263 77 345 6789",
    address: "789 Julius Nyerere Way, Harare",
    businessRegistration: "BR-2021-023",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

// Sample applications
permit_management.applications.insertMany([
  {
    applicationId: "PRM-2024-001",
    operatorName: "City Express Transport",
    contactPerson: "John Mukamuri",
    email: "john@cityexpress.co.zw",
    phone: "+263 77 123 4567",
    address: "123 Samora Machel Avenue, Harare",
    businessRegistration: "BR-2020-001",
    routeFrom: "CBD (Central Business District)",
    routeTo: "Chitungwiza",
    vehicleCount: 5,
    operatingHours: "05:00 - 22:00",
    description: "Regular commuter service between CBD and Chitungwiza with stops at major intersections",
    status: "pending",
    submittedDate: "2024-01-15",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    timeline: [
      {
        status: "submitted",
        date: "2024-01-15",
        time: "09:30",
        description: "Application submitted successfully",
        completed: true,
      },
    ],
  },
  {
    applicationId: "PRM-2024-002",
    operatorName: "Harare Commuter Services",
    contactPerson: "Mary Chikwanha",
    email: "mary@hcs.co.zw",
    phone: "+263 77 234 5678",
    address: "456 Robert Mugabe Road, Harare",
    businessRegistration: "BR-2019-045",
    routeFrom: "CBD (Central Business District)",
    routeTo: "Mbare",
    vehicleCount: 8,
    operatingHours: "04:30 - 23:00",
    description: "High-frequency service to Mbare with express and regular stops",
    status: "approved",
    submittedDate: "2024-01-12",
    approvedDate: "2024-01-20",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-20"),
    timeline: [
      {
        status: "submitted",
        date: "2024-01-12",
        time: "14:15",
        description: "Application submitted successfully",
        completed: true,
      },
      {
        status: "under_review",
        date: "2024-01-15",
        time: "10:00",
        description: "Application under technical review",
        completed: true,
      },
      {
        status: "approved",
        date: "2024-01-20",
        time: "16:30",
        description: "Application approved - permit issued",
        completed: true,
      },
    ],
  },
])

// Sample vehicles
permit_management.vehicles.insertMany([
  {
    registrationNumber: "AEZ 1234",
    operatorName: "City Express Transport",
    model: "Toyota Hiace",
    year: 2020,
    capacity: 14,
    status: "active",
    lastInspection: "2024-01-01",
    nextInspection: "2024-07-01",
    insuranceExpiry: "2024-12-31",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    registrationNumber: "AEZ 5678",
    operatorName: "Harare Commuter Services",
    model: "Nissan Caravan",
    year: 2019,
    capacity: 16,
    status: "active",
    lastInspection: "2023-12-15",
    nextInspection: "2024-06-15",
    insuranceExpiry: "2024-11-30",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    registrationNumber: "AEZ 9012",
    operatorName: "Metro Bus Lines",
    model: "Toyota Quantum",
    year: 2021,
    capacity: 18,
    status: "maintenance",
    lastInspection: "2023-11-20",
    nextInspection: "2024-05-20",
    insuranceExpiry: "2024-10-15",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

// Create admin user (password should be hashed in real implementation)
permit_management.users.insertOne({
  email: "admin@harare.gov.zw",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcQs9BpeG", // hashed "admin123"
  role: "admin",
  firstName: "System",
  lastName: "Administrator",
  createdAt: new Date(),
  updatedAt: new Date(),
})

print("Database setup completed successfully!")
print("Collections created: applications, vehicles, operators, routes, users")
print("Indexes created for optimal performance")
print("Sample data inserted")
print("Admin user created with email: admin@harare.gov.zw and password: admin123")
