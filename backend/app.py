from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import bcrypt
import jwt
from functools import wraps
import pytz
from pprint import pprint
import os
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
cat_tz = pytz.timezone('Africa/Harare')

# Configuration
UPLOAD_FOLDER = "uploads"
app.config['SECRET_KEY'] = "eibgrlgnrwljfweufhewoufnbewjfwefjkebo"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client.permit_management

# Collections
users_collection = db.users
applications_collection = db.applications
vehicles_collection = db.vehicles
operators_collection = db.operators
officers_collection  = db.operators

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now(cat_tz).strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return f'uploads/{filename}'
    else:
        return False
    
def serialize_application(application):
    if application:
        application['_id'] = str(application['_id'])

        if 'createdAt' in application and isinstance(application['createdAt'], datetime):
            application['createdAt'] = application['createdAt'].isoformat()

        if 'updatedAt' in application and isinstance(application['updatedAt'], datetime):
            application['updatedAt'] = application['updatedAt'].isoformat()
            
        if 'timeline' in application and application['timeline']:
            for event in application['timeline']:
                if 'date' in event and isinstance(event['date'], datetime):
                    event['date'] = event['date'].strftime('%Y-%m-%d')    
    return application

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').strip()
    
        if not token:
            return {'message': 'Token is missing'}, 401

        if token.startswith('Bearer '):
            token = token[len('Bearer '):]

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data.get('user_id') or data.get('id')
            if not user_id:
                return {'message': 'Invalid token payload'}, 401

            current_user = users_collection.find_one({'_id': ObjectId(user_id)})
            if not current_user:
                return {'message': 'User not found'}, 401

        except jwt.ExpiredSignatureError:
            return {'message': 'Token has expired'}, 401
        except jwt.InvalidTokenError:
            return {'message': 'Token is invalid'}, 401
        except Exception:
            return {'message': 'Token validation failed'}, 401

        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user):
    token_payload = {
        'id': str(user['_id']),
        'exp': datetime.now(cat_tz) + timedelta(hours=24)
    }
    
    token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token 

@app.route("/api/create/admin", methods = ["POST"])
@token_required
def create_admin(current_user):
    #data = request.get_json()
    pprint(current_user)
    return {
        "message" : "Hello World"
    }, 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'accountType']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
   
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'message': 'Email address already registered'}), 409

        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        user_doc = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email'].lower(),
            'phone': data['phone'],
            'password': password_hash,
            'role': 'admin' if data['accountType'] == 'admin' else 'operator',
            'businessInformation': {
                "companyName" : data["companyName"],
                "businessRegistration" : data["businessRegistration"],
                "businessAddress" : data["businessAddress"],
                "contactPerson" : data["contactPerson"]
            },
            'createdAt': datetime.now(cat_tz),
            'updatedAt': datetime.now(cat_tz)
        }
        
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        user = {
            "_id" : user_id,
            "email" : user_doc["email"],
            "firstName" : user_doc.get("firstName"),
            "lastName" : user_doc.get("lastName"),
            "role" : user_doc.get("role")
        }

        token = generate_token(user)
        if user_id:
            return {
                'success': True,
                'message': 'Account created successfully! Please check your email to verify your account.',
                "token" : token,
                'user': user
            }, 200
      
            
    except Exception as e:
        pprint(f"Registration error: {str(e)}")
        return {'message': 'Internal server error'}, 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
            
        token = generate_token(user)

        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'lastLogin': datetime.now(cat_tz)}}
        )
        
        user_data = {
            '_id': str(user['_id']),
            'email': user['email'],
            'firstName': user.get('firstName'),
            'lastName': user.get('lastName'),
            'role': user['role'],
        }
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user_data,
            'message': 'Login successful'
        })
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route("/api/client/dashboard", methods = ["GET"])
@token_required
def get_client_dashboard(current_user):
    try:
        id = str(current_user.get("_id"))
        totalApplications = applications_collection.count_documents({"ownerID" : id})
        activePermits = applications_collection.count_documents({"ownerID" : id, "status" : "active"})
        registeredVehicles = vehicles_collection.count_documents({"ownerID" : id, "status" : "approved"})
        pendingReviews = applications_collection.count_documents({"ownerID" : id , "status" : "pending"})

        return{
            "success" : True,
            "stats" : {
                "totalApplications" : totalApplications,
                "activePermits" : activePermits,
                "registeredVehicles" : registeredVehicles,
                "pendingReviews" : pendingReviews
            }
        }, 200
    
    except Exception as e:
        pprint("Error fetching client dashbaord :" + e)
        return {
            "success" : False,
            "message" : "Something happened proobably your fault too"
        }, 401

@app.route('/api/applications', methods=['GET'])
@token_required
def get_client_applications(current_user):
    try:
        id = str(current_user["_id"])
        page = max(1, int(request.args.get('page', 1)))  
        limit = min(50, max(1, int(request.args.get('limit', 10))))       
        skip = (page - 1) * limit
        
        total = applications_collection.count_documents({"ownerID": str(id)})
        total_pages = (total + limit - 1) // limit if total > 0 else 1
        
        if page > total_pages and total > 0:
            return {
                "success": False,
                "message": f"Page {page} not found. Maximum page is {total_pages}"
            }, 404
        
        applications = list(
            applications_collection.find({"ownerID": str(id)})
            .skip(skip)
            .limit(limit)
            .sort('createdAt', 1)
        )
        trimmedApplications = []

        for application in applications:
            trimmedApplication = {
                "id" : str(application.get("id")),
                "status" : application.get("status"),
                "applicationId": application.get("applicationId"),
                "routeFrom": application.get("routeFrom"),
                "routeTo": application.get("routeTo"),
                "vehicleCount": application.get("vehicleCount"),
                "submittedDate": application.get("submittedDate"),
            }
            trimmedApplications.append(trimmedApplication)

        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total,
            "has_previous": page > 1,
            "has_next": page < total_pages,
            "previous_page": page - 1 if page > 1 else None,
            "next_page": page + 1 if page < total_pages else None,
        }
        
        return {
            "success": True,
            "results": trimmedApplications,
            "pagination": pagination
        }, 200
    
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/api/applications', methods=['POST'])
@token_required
def create_application(current_user):
    try:
        form = request.form
        files = request.files

        required_fields = ['operatorName', 'contactPerson', 'email', 'phone', 'routeFrom', 'routeTo']
        for field in required_fields:
            if not form.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        saved_files = {}
        for key in ['businessRegistrationCertificate', 'vehicleDocuments', 'insuranceCertificates', 'driversLicenses']:
            file = files.get(key)
            if file:
                file_path  = save_file(file)
                saved_files[key] = "NULL" if not file_path else file_path

        year = datetime.now().year
        count = applications_collection.count_documents({'submittedDate': {'$regex': f'^{year}'}})
        application_id = f"PRM-{year}-{str(count + 1).zfill(3)}"

        application = {
            'applicationId': application_id,
            "ownerID" : str(current_user.get("_id")),
            **form.to_dict(),
            'status': 'pending',
            'submittedDate': datetime.now(cat_tz).strftime('%Y-%m-%d'),
            'createdAt': datetime.now(cat_tz),
            'updatedAt': datetime.now(cat_tz),
            'uploadedFiles': saved_files,
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

        applications_collection.insert_one(application)
        return jsonify({
            'success': True,
            'applicationId': application_id,
            'message': 'Application submitted successfully'
        }), 201

    except Exception as e:
        pprint(e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/applications/<application_id>', methods=['GET'])
def get_application(application_id):
    try:
        application = applications_collection.find_one({'applicationId': application_id})   
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        serialized_app = serialize_application(application)
        
        app.logger.info(f"Application fetched successfully: {application_id}")
        return jsonify(serialized_app), 200
    
    except Exception as e:
        app.logger.error(f"Error fetching application {application_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route("/api/client/search/application", methods = ["GET"])
@token_required
def search_application(current_user):
    query = request.args.get("q", None)
    mode = request.args.get("mode", "default")
    id = str(current_user.get("_id"))

    if not query:
        return {
            "success" : False,
            "message" :"Empty query"
        }
    try:
        if mode == "default":
            applications = list(applications_collection.find({
                "ownerID": id,
                "applicationId": {
                    "$regex": f"{query}",
                    "$options": "i"
                }
            }).limit(5))

            trimmedApplications = []
            for application in applications:
                trimmedApplication  = {
                    "id" : str(application.get("_id")),
                    "applicationId" : application.get("applicationId"),
                    "route" : f"{application.get("routeFrom")} - {application.get("routeTo")}",
                    "status":  application.get("status"),
                    "submittedDate" :  application.get("submittedDate"),
                    "vehicleCount" : application.get("vehicleCount"),
                    "operatorName": application.get("operatorName"),
                    "contactPerson": application.get("contactPerson"),
                    "timeline": application.get("timeline") 
                }

                trimmedApplications.append(trimmedApplication)

            return {
                "success" : True,
                "results" :  trimmedApplications
            }, 200
        
        elif mode == "single":
            application = applications_collection.find_one({
                "ownerID": id,
                "applicationId": {
                    "$regex": f"^{query}$",
                    "$options": "i"
                }
            })

            return {
                "success" : True,
                "result" :  {
                    "id" : str(application.get("_id")),
                    "applicationId" : application.get("applicationId"),
                    "route" : f"{application.get("routeFrom")} - {application.get("routeTo")}",
                    "status":  application.get("status"),
                    "submittedDate" :  application.get("submittedDate"),
                    "vehicleCount" : application.get("vehicleCount"),
                    "operatorName": application.get("operatorName"),
                    "contactPerson": application.get("contactPerson"),
                    "timeline": application.get("timeline") 
                }
            }, 200


    except Exception as e:
        app.logger.error(f"Search error: {e}")
        return {"success": False, "message": "An error occurred"}, 500

@app.route('/api/applications/<application_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_application_status(current_user, application_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        comment = data.get('comment', '')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        update_data = {
            'status': new_status,
            'updatedAt': datetime.utcnow()
        }
        
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
        
        return jsonify({'message': 'Status updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/vehicles/register', methods=['POST'])
@token_required
def register_vehicle(current_user):
    try:
        form = request.form
        files = request.files

        existing_vehicle = vehicles_collection.find_one({
            'registrationNumber': form['registrationNumber'].upper()
        })
        
        if existing_vehicle:
            return jsonify({'error': 'Vehicle with this registration number already exists'}), 409
        
        vehicle_count = vehicles_collection.count_documents({})
        vehicle_id = f"VEH-{str(vehicle_count + 1).zfill(3)}"

        saved_files = {}
        for key in ['vehicleDocuments', 'insuranceCertificates', 'driversLicenses']:
            file = files.get(key)
            if file:
                file_path = save_file(file)
                saved_files[key] = "NULL" if not file_path else file_path

        vehicle_doc = {
            "ownerID" :  str(current_user.get('_id')),
            'vehicleId': vehicle_id,
            'registrationNumber': form['registrationNumber'].upper(),
            'make': form['make'],
            'model': form['model'],
            'year': int(form['year']),
            'capacity': int(form['capacity']),
            'engineNumber': form['engineNumber'],
            'chassisNumber': form['chassisNumber'],
            'color': form['color'],
            'fuelType': form['fuelType'],
            'insuranceCompany': form['insuranceCompany'],
            'insurancePolicyNumber': form['insurancePolicyNumber'],
            'insuranceExpiryDate': form['insuranceExpiryDate'],
            'roadworthyExpiryDate': form['roadworthyExpiryDate'],
            'operatingRoute': form['operatingRoute'],
            'driverName': form['driverName'],
            'driverLicenseNumber': form['driverLicenseNumber'],
            'driverLicenseExpiry': form['driverLicenseExpiry'],
            'status': 'pending_approval',
            "uploadedFiles" : saved_files,
            'registrationDate': datetime.now(cat_tz).strftime('%Y-%m-%d'),
            'createdAt': datetime.now(cat_tz),
            'updatedAt': datetime.now(cat_tz)
        }

        result = vehicles_collection.insert_one(vehicle_doc)
        vehicle_doc['_id'] = str(result.inserted_id)
        
        return {
            'success': True,
            'vehicleId': vehicle_id,
            'message': 'Vehicle registered successfully and is pending approval'
        }, 201

    except Exception as e:
        print(f"Register vehicle error: {str(e)}")
        return {'error': 'Internal server error'}, 500

@app.route("/api/vehicles", methods=["GET"])
@token_required
def get_client_vehicles(current_user):
    try:
        id = current_user["_id"]
        page = max(1, int(request.args.get('page', 1)))  
        limit = min(50, max(1, int(request.args.get('limit', 10))))       
        skip = (page - 1) * limit
        
        total = vehicles_collection.count_documents({"ownerID": str(id)})
        total_pages = (total + limit - 1) // limit if total > 0 else 1
        
        if page > total_pages and total > 0:
            return {
                "success": False,
                "message": f"Page {page} not found. Maximum page is {total_pages}"
            }, 404
        
        vehicles = list(
            vehicles_collection.find({"ownerID": str(id)})
            .skip(skip)
            .limit(limit)
            .sort('registrationNumber', 1)
        )
        
        trimmed_vehicles = []
        for vehicle in vehicles:
            trimmed_vehicle = {
                "_id": str(vehicle['_id']), 
                "status" : vehicle.get("status"),
                "registrationNumber": vehicle["registrationNumber"],
                "make": vehicle["make"],
                "model": vehicle["model"],
                "insuranceCompany": vehicle["insuranceCompany"],
                "driverName": vehicle.get("driverName")
            }
            trimmed_vehicles.append(trimmed_vehicle)
        
        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total,
            "has_previous": page > 1,
            "has_next": page < total_pages,
            "previous_page": page - 1 if page > 1 else None,
            "next_page": page + 1 if page < total_pages else None,
        }
        
        return {
            "success": True,
            "results": trimmed_vehicles,
            "pagination": pagination
        }, 200
    
    except ValueError:
        return {
            "success": False,
            "message": "Invalid page or limit parameter. Must be integers."
        }, 400
    
    except Exception as e:
        app.logger.error(f"Error in get_client_vehicles: {str(e)}")
        return {
            "success": False,
            "message": "An error occurred while fetching vehicles"
        }, 500
    
@app.route('/api/admin/vehicles', methods=['GET'])
@admin_required
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

@app.route('/api/files/download', methods=['GET'])
def download_file():
    try:
        file_path = request.args.get('path')
        
        if not file_path:
            return jsonify({'error': 'File path is required'}), 400
        
        if not file_path.startswith('uploads/'):
            return jsonify({'error': 'Invalid file path'}), 400
        
        full_path = os.path.join(app.config['UPLOAD_FOLDER'], file_path.replace('uploads/', ''))
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(full_path, as_attachment=True)
    
    except Exception as e:
        app.logger.error(f"Error downloading file: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
  
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
