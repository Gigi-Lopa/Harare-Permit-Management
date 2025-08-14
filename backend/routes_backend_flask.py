# Enhanced Flask backend with routes management for the Permit Management System

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
import re

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
app.config['DATABASE_NAME'] = 'permit_management'

# MongoDB connection
client = MongoClient(app.config['MONGODB_URI'])
db = client[app.config['DATABASE_NAME']]

# Collections
routes_collection = db.routes
vehicles_collection = db.vehicles
applications_collection = db.applications
operators_collection = db.operators
users_collection = db.users

def validate_route_data(data):
    """Validate route data"""
    required_fields = ['fromLocation', 'toLocation', 'distance', 'estimatedTime', 'fare']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Missing required field: {field}"
    
    # Validate distance
    try:
        distance = float(data['distance'])
        if distance <= 0 or distance > 200:
            return False, "Distance must be between 0 and 200 km"
    except ValueError:
        return False, "Distance must be a valid number"
    
    # Validate estimated time
    try:
        time = int(data['estimatedTime'])
        if time <= 0 or time > 300:
            return False, "Estimated time must be between 1 and 300 minutes"
    except ValueError:
        return False, "Estimated time must be a valid number"
    
    # Validate fare
    try:
        fare = float(data['fare'])
        if fare <= 0 or fare > 50:
            return False, "Fare must be between 0 and 50 USD"
    except ValueError:
        return False, "Fare must be a valid number"
    
    return True, "Valid"

def validate_vehicle_data(data):
    """Validate vehicle registration data"""
    required_fields = [
        'registrationNumber', 'make', 'model', 'year', 'capacity',
        'engineNumber', 'chassisNumber', 'color', 'fuelType',
        'insuranceCompany', 'insurancePolicyNumber', 'insuranceExpiryDate',
        'roadworthyExpiryDate', 'operatingRoute', 'driverName',
        'driverLicenseNumber', 'driverLicenseExpiry'
    ]
    
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f"Missing required field: {field}"
    
    # Validate registration number format (ABC 1234)
    reg_pattern = r'^[A-Z]{3} \d{4}$'
    if not re.match(reg_pattern, data['registrationNumber']):
        return False, "Registration number must be in format ABC 1234"
    
    # Validate capacity
    try:
        capacity = int(data['capacity'])
        if capacity < 10 or capacity > 30:
            return False, "Vehicle capacity must be between 10 and 30 passengers"
    except ValueError:
        return False, "Capacity must be a valid number"
    
    # Validate year
    try:
        year = int(data['year'])
        current_year = datetime.now().year
        if year < 2000 or year > current_year:
            return False, f"Vehicle year must be between 2000 and {current_year}"
    except ValueError:
        return False, "Year must be a valid number"
    
    # Validate dates
    try:
        insurance_expiry = datetime.strptime(data['insuranceExpiryDate'], '%Y-%m-%d')
        roadworthy_expiry = datetime.strptime(data['roadworthyExpiryDate'], '%Y-%m-%d')
        license_expiry = datetime.strptime(data['driverLicenseExpiry'], '%Y-%m-%d')
        today = datetime.now()
        
        if insurance_expiry <= today:
            return False, "Insurance must be valid for at least one day"
        
        if roadworthy_expiry <= today:
            return False, "Roadworthy certificate must be valid"
        
        if license_expiry <= today:
            return False, "Driver's license must be valid"
            
    except ValueError:
        return False, "Invalid date format. Use YYYY-MM-DD"
    
    return True, "Valid"

# Routes Management APIs
@app.route('/api/routes', methods=['GET'])
def get_routes():
    try:
        # Get query parameters
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = {}
        if status and status != 'all':
            query['status'] = status
        
        if search:
            search_regex = {'$regex': search, '$options': 'i'}
            query['$or'] = [
                {'routeId': search_regex},
                {'fromLocation': search_regex},
                {'toLocation': search_regex}
            ]
        
        # Get routes with pagination
        skip = (page - 1) * limit
        routes = list(routes_collection.find(query).skip(skip).limit(limit).sort('routeId', 1))
        total = routes_collection.count_documents(query)
        
        # Convert ObjectId to string
        for route in routes:
            route['_id'] = str(route['_id'])
        
        return jsonify({
            'success': True,
            'routes': routes,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    except Exception as e:
        print(f"Get routes error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/routes', methods=['POST'])
def create_route():
    try:
        data = request.get_json()
        
        # Validate route data
        is_valid, message = validate_route_data(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if route already exists
        existing_route = routes_collection.find_one({
            'fromLocation': data['fromLocation'],
            'toLocation': data['toLocation']
        })
        
        if existing_route:
            return jsonify({'error': 'Route already exists between these locations'}), 409
        
        # Generate route ID
        route_count = routes_collection.count_documents({})
        route_id = f"RT-{str(route_count + 1).zfill(3)}"
        
        # Create route document
        route_doc = {
            'routeId': route_id,
            'fromLocation': data['fromLocation'],
            'toLocation': data['toLocation'],
            'distance': float(data['distance']),
            'estimatedTime': int(data['estimatedTime']),
            'fare': float(data['fare']),
            'status': 'active',
            'operatingVehicles': 0,
            'dailyTrips': 0,
            'description': data.get('description', ''),
            'stops': data.get('stops', []),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = routes_collection.insert_one(route_doc)
        route_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'route': route_doc,
            'message': 'Route created successfully'
        }), 201
    
    except Exception as e:
        print(f"Create route error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/routes/<route_id>', methods=['PUT'])
def update_route(route_id):
    try:
        data = request.get_json()
        
        # Find existing route
        route = routes_collection.find_one({'routeId': route_id})
        if not route:
            return jsonify({'error': 'Route not found'}), 404
        
        # Validate updated data
        is_valid, message = validate_route_data(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Update route
        update_data = {
            'fromLocation': data['fromLocation'],
            'toLocation': data['toLocation'],
            'distance': float(data['distance']),
            'estimatedTime': int(data['estimatedTime']),
            'fare': float(data['fare']),
            'description': data.get('description', ''),
            'stops': data.get('stops', []),
            'updatedAt': datetime.utcnow()
        }
        
        routes_collection.update_one(
            {'routeId': route_id},
            {'$set': update_data}
        )
        
        return jsonify({
            'success': True,
            'message': 'Route updated successfully'
        })
    
    except Exception as e:
        print(f"Update route error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/routes/<route_id>', methods=['DELETE'])
def delete_route(route_id):
    try:
        # Check if route has active vehicles
        active_vehicles = vehicles_collection.count_documents({
            'operatingRoute': {'$regex': route_id, '$options': 'i'},
            'status': 'active'
        })
        
        if active_vehicles > 0:
            return jsonify({
                'error': f'Cannot delete route. {active_vehicles} active vehicles are using this route.'
            }), 400
        
        # Delete route
        result = routes_collection.delete_one({'routeId': route_id})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Route not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Route deleted successfully'
        })
    
    except Exception as e:
        print(f"Delete route error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Vehicle Registration APIs
@app.route('/api/vehicles/register', methods=['POST'])
def register_vehicle():
    try:
        data = request.get_json()
        
        # Validate vehicle data
        is_valid, message = validate_vehicle_data(data)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if registration number already exists
        existing_vehicle = vehicles_collection.find_one({
            'registrationNumber': data['registrationNumber'].upper()
        })
        
        if existing_vehicle:
            return jsonify({'error': 'Vehicle with this registration number already exists'}), 409
        
        # Generate vehicle ID
        vehicle_count = vehicles_collection.count_documents({})
        vehicle_id = f"VEH-{str(vehicle_count + 1).zfill(3)}"
        
        # Create vehicle document
        vehicle_doc = {
            'vehicleId': vehicle_id,
            'registrationNumber': data['registrationNumber'].upper(),
            'make': data['make'],
            'model': data['model'],
            'year': int(data['year']),
            'capacity': int(data['capacity']),
            'engineNumber': data['engineNumber'],
            'chassisNumber': data['chassisNumber'],
            'color': data['color'],
            'fuelType': data['fuelType'],
            'insuranceCompany': data['insuranceCompany'],
            'insurancePolicyNumber': data['insurancePolicyNumber'],
            'insuranceExpiryDate': data['insuranceExpiryDate'],
            'roadworthyExpiryDate': data['roadworthyExpiryDate'],
            'operatingRoute': data['operatingRoute'],
            'driverName': data['driverName'],
            'driverLicenseNumber': data['driverLicenseNumber'],
            'driverLicenseExpiry': data['driverLicenseExpiry'],
            'status': 'pending_approval',
            'registrationDate': datetime.now().strftime('%Y-%m-%d'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = vehicles_collection.insert_one(vehicle_doc)
        vehicle_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'vehicleId': vehicle_id,
            'message': 'Vehicle registered successfully and is pending approval'
        }), 201
    
    except Exception as e:
        print(f"Register vehicle error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    try:
        # Get query parameters
        status = request.args.get('status')
        operator = request.args.get('operator')
        route = request.args.get('route')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = {}
        if status and status != 'all':
            query['status'] = status
        
        if operator:
            query['operatorName'] = {'$regex': operator, '$options': 'i'}
        
        if route:
            query['operatingRoute'] = {'$regex': route, '$options': 'i'}
        
        # Get vehicles with pagination
        skip = (page - 1) * limit
        vehicles = list(vehicles_collection.find(query).skip(skip).limit(limit).sort('registrationNumber', 1))
        total = vehicles_collection.count_documents(query)
        
        # Convert ObjectId to string
        for vehicle in vehicles:
            vehicle['_id'] = str(vehicle['_id'])
        
        return jsonify({
            'success': True,
            'vehicles': vehicles,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    except Exception as e:
        print(f"Get vehicles error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/vehicles/<vehicle_id>', methods=['PUT'])
def update_vehicle(vehicle_id):
    try:
        data = request.get_json()
        
        # Find existing vehicle
        vehicle = vehicles_collection.find_one({'vehicleId': vehicle_id})
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Update vehicle
        update_data = {
            'status': data.get('status', vehicle['status']),
            'operatingRoute': data.get('operatingRoute', vehicle['operatingRoute']),
            'driverName': data.get('driverName', vehicle['driverName']),
            'driverLicenseNumber': data.get('driverLicenseNumber', vehicle['driverLicenseNumber']),
            'driverLicenseExpiry': data.get('driverLicenseExpiry', vehicle['driverLicenseExpiry']),
            'insuranceExpiryDate': data.get('insuranceExpiryDate', vehicle['insuranceExpiryDate']),
            'roadworthyExpiryDate': data.get('roadworthyExpiryDate', vehicle['roadworthyExpiryDate']),
            'updatedAt': datetime.utcnow()
        }
        
        vehicles_collection.update_one(
            {'vehicleId': vehicle_id},
            {'$set': update_data}
        )
        
        return jsonify({
            'success': True,
            'message': 'Vehicle updated successfully'
        })
    
    except Exception as e:
        print(f"Update vehicle error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/vehicles/<vehicle_id>', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    try:
        # Check if vehicle is active
        vehicle = vehicles_collection.find_one({'vehicleId': vehicle_id})
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        if vehicle['status'] == 'active':
            return jsonify({
                'error': 'Cannot delete active vehicle. Please change status first.'
            }), 400
        
        # Delete vehicle
        result = vehicles_collection.delete_one({'vehicleId': vehicle_id})
        
        return jsonify({
            'success': True,
            'message': 'Vehicle deleted successfully'
        })
    
    except Exception as e:
        print(f"Delete vehicle error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Application Management APIs
@app.route('/api/applications/<application_id>', methods=['PUT'])
def update_application(application_id):
    try:
        data = request.get_json()
        
        # Find existing application
        application = applications_collection.find_one({'applicationId': application_id})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Update application
        update_data = {
            'operatorName': data.get('operatorName', application['operatorName']),
            'contactPerson': data.get('contactPerson', application['contactPerson']),
            'route': data.get('route', application.get('route', f"{application['routeFrom']} - {application['routeTo']}")),
            'vehicleCount': int(data.get('vehicleCount', application['vehicleCount'])),
            'status': data.get('status', application['status']),
            'updatedAt': datetime.utcnow()
        }
        
        # Add timeline entry for status changes
        if data.get('status') and data['status'] != application['status']:
            timeline_entry = {
                'status': data['status'],
                'date': datetime.now().strftime('%Y-%m-%d'),
                'time': datetime.now().strftime('%H:%M'),
                'description': f'Status updated to {data["status"]}',
                'updatedBy': 'admin'  # In real app, get from JWT token
            }
            
            applications_collection.update_one(
                {'applicationId': application_id},
                {'$push': {'timeline': timeline_entry}}
            )
        
        applications_collection.update_one(
            {'applicationId': application_id},
            {'$set': update_data}
        )
        
        return jsonify({
            'success': True,
            'message': 'Application updated successfully'
        })
    
    except Exception as e:
        print(f"Update application error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/applications/<application_id>', methods=['DELETE'])
def delete_application(application_id):
    try:
        # Find application
        application = applications_collection.find_one({'applicationId': application_id})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Check if application can be deleted
        if application['status'] == 'approved':
            return jsonify({
                'error': 'Cannot delete approved application. Please revoke approval first.'
            }), 400
        
        # Delete application
        result = applications_collection.delete_one({'applicationId': application_id})
        
        return jsonify({
            'success': True,
            'message': 'Application deleted successfully'
        })
    
    except Exception as e:
        print(f"Delete application error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Operators Management APIs
@app.route('/api/operators', methods=['GET'])
def get_operators():
    try:
        # Get query parameters
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = {}
        if status and status != 'all':
            query['status'] = status
        
        if search:
            search_regex = {'$regex': search, '$options': 'i'}
            query['$or'] = [
                {'operatorName': search_regex},
                {'contactPerson': search_regex},
                {'email': search_regex}
            ]
        
        # Get operators with pagination
        skip = (page - 1) * limit
        operators = list(operators_collection.find(query).skip(skip).limit(limit).sort('operatorName', 1))
        total = operators_collection.count_documents(query)
        
        # Add statistics for each operator
        for operator in operators:
            operator['_id'] = str(operator['_id'])
            
            # Count active permits
            operator['activePermits'] = applications_collection.count_documents({
                'operatorName': operator['operatorName'],
                'status': 'approved'
            })
            
            # Count vehicles
            operator['vehicles'] = vehicles_collection.count_documents({
                'operatorName': operator['operatorName']
            })
        
        return jsonify({
            'success': True,
            'operators': operators,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    except Exception as e:
        print(f"Get operators error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/operators', methods=['POST'])
def create_operator():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['operatorName', 'contactPerson', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if operator already exists
        existing_operator = operators_collection.find_one({
            '$or': [
                {'operatorName': data['operatorName']},
                {'email': data['email']}
            ]
        })
        
        if existing_operator:
            return jsonify({'error': 'Operator with this name or email already exists'}), 409
        
        # Create operator document
        operator_doc = {
            'operatorName': data['operatorName'],
            'contactPerson': data['contactPerson'],
            'email': data['email'].lower(),
            'phone': data['phone'],
            'address': data.get('address', ''),
            'businessRegistration': data.get('businessRegistration', ''),
            'status': 'active',
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = operators_collection.insert_one(operator_doc)
        operator_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'operator': operator_doc,
            'message': 'Operator created successfully'
        }), 201
    
    except Exception as e:
        print(f"Create operator error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
