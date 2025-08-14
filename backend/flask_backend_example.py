# Example Flask backend structure for the Permit Management System
# This shows how you would implement the backend in Flask with MongoDB

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client.permit_management

# Collections
applications_collection = db.applications
vehicles_collection = db.vehicles
operators_collection = db.operators
routes_collection = db.routes
users_collection = db.users

# JWT Secret Key
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Authentication Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = users_collection.find_one({'email': email})
    
    if user and check_password_hash(user['password'], password):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'role': user['role']
            }
        })
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Application Routes
@app.route('/api/applications', methods=['GET'])
@token_required
def get_applications(current_user):
    try:
        # Get query parameters
        status = request.args.get('status')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Build query
        query = {}
        if status and status != 'all':
            query['status'] = status
        
        # Get applications with pagination
        skip = (page - 1) * limit
        applications = list(applications_collection.find(query).skip(skip).limit(limit))
        total = applications_collection.count_documents(query)
        
        # Convert ObjectId to string
        for app in applications:
            app['_id'] = str(app['_id'])
        
        return jsonify({
            'applications': applications,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications', methods=['POST'])
def create_application():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['operatorName', 'contactPerson', 'email', 'phone', 'routeFrom', 'routeTo']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Generate application ID
        year = datetime.now().year
        count = applications_collection.count_documents({'submittedDate': {'$regex': f'^{year}'}})
        application_id = f"PRM-{year}-{str(count + 1).zfill(3)}"
        
        # Create application document
        application = {
            'applicationId': application_id,
            'operatorName': data['operatorName'],
            'contactPerson': data['contactPerson'],
            'email': data['email'],
            'phone': data['phone'],
            'address': data.get('address', ''),
            'businessRegistration': data.get('businessRegistration', ''),
            'routeFrom': data['routeFrom'],
            'routeTo': data['routeTo'],
            'vehicleCount': int(data.get('vehicleCount', 0)),
            'operatingHours': data.get('operatingHours', ''),
            'description': data.get('description', ''),
            'status': 'pending',
            'submittedDate': datetime.now().strftime('%Y-%m-%d'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow(),
            'timeline': [
                {
                    'status': 'submitted',
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'time': datetime.now().strftime('%H:%M'),
                    'description': 'Application submitted successfully',
                    'completed': True
                }
            ]
        }
        
        # Insert into database
        result = applications_collection.insert_one(application)
        
        # Send confirmation email (implement email service)
        # send_confirmation_email(data['email'], application_id)
        
        return jsonify({
            'success': True,
            'applicationId': application_id,
            'message': 'Application submitted successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<application_id>', methods=['GET'])
def get_application(application_id):
    try:
        application = applications_collection.find_one({'applicationId': application_id})
        
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        application['_id'] = str(application['_id'])
        return jsonify(application)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<application_id>/status', methods=['PUT'])
@token_required
def update_application_status(current_user, application_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        comment = data.get('comment', '')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        # Update application
        update_data = {
            'status': new_status,
            'updatedAt': datetime.utcnow()
        }
        
        # Add timeline entry
        timeline_entry = {
            'status': new_status,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%H:%M'),
            'description': f'Status updated to {new_status}',
            'comment': comment,
            'updatedBy': str(current_user['_id'])
        }
        
        applications_collection.update_one(
            {'applicationId': application_id},
            {
                '$set': update_data,
                '$push': {'timeline': timeline_entry}
            }
        )
        
        # Send notification email
        # send_status_update_email(application_id, new_status)
        
        return jsonify({'message': 'Status updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vehicle Routes
@app.route('/api/vehicles', methods=['GET'])
@token_required
def get_vehicles(current_user):
    try:
        vehicles = list(vehicles_collection.find())
        for vehicle in vehicles:
            vehicle['_id'] = str(vehicle['_id'])
        
        return jsonify({'vehicles': vehicles})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles', methods=['POST'])
@token_required
def create_vehicle(current_user):
    try:
        data = request.get_json()
        
        vehicle = {
            'registrationNumber': data['registrationNumber'],
            'operatorName': data['operatorName'],
            'model': data['model'],
            'capacity': int(data['capacity']),
            'status': 'active',
            'lastInspection': data.get('lastInspection'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        result = vehicles_collection.insert_one(vehicle)
        vehicle['_id'] = str(result.inserted_id)
        
        return jsonify({
            'success': True,
            'vehicle': vehicle,
            'message': 'Vehicle registered successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route Management
@app.route('/api/routes', methods=['GET'])
def get_routes():
    try:
        routes = list(routes_collection.find())
        for route in routes:
            route['_id'] = str(route['_id'])
        
        return jsonify({'routes': routes})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Statistics and Reports
@app.route('/api/stats', methods=['GET'])
@token_required
def get_statistics(current_user):
    try:
        stats = {
            'totalApplications': applications_collection.count_documents({}),
            'pendingApplications': applications_collection.count_documents({'status': 'pending'}),
            'approvedApplications': applications_collection.count_documents({'status': 'approved'}),
            'totalVehicles': vehicles_collection.count_documents({}),
            'activeVehicles': vehicles_collection.count_documents({'status': 'active'}),
            'totalOperators': operators_collection.count_documents({}),
            'totalRoutes': routes_collection.count_documents({})
        }
        
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
