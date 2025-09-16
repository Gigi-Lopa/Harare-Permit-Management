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
import random
from werkzeug.utils import secure_filename
from bson.errors import InvalidId


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
db = client.permit_administration

# Collections
users_collection = db.users
applications_collection = db.applications
vehicles_collection = db.vehicles
officers_collection  = db.officers
violations_collection = db.violations

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
    user_id = None

    if isinstance(user, dict) and "_id" in user:
        user_id = str(user["_id"])
    elif hasattr(user, "inserted_id"):
        user_id = str(user.inserted_id)
    token_payload = {
        "id": str(user_id),
        "exp": datetime.now(cat_tz) + timedelta(hours=24)  
    }

    token = jwt.encode(token_payload, app.config["SECRET_KEY"], algorithm="HS256")
    return token

def officer_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").strip()
        if not token:
            return {'message': 'Token is missing'}, 401

        if token.startswith('Bearer '):
            token = token[len('Bearer '):]

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data.get('user_id') or data.get('id')

            if not user_id:
                return {'message': 'Invalid token payload'}, 401

            current_user = officers_collection.find_one({'_id': ObjectId(user_id)})
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

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def generate_random():
    return str(random.randint(1, 99999)).zfill(5)

def generate_unique_application_id():
    while True:
        app_id = f"PRM-{generate_random()}"
        if not applications_collection.find_one({"applicationId": app_id}):
            return app_id
        
def generate_unique_vehicle_id():
    while True:
        VEH_ID = f"VEH-{generate_random()}"
        if not vehicles_collection.find_one({"vehicleId": VEH_ID}):
            return VEH_ID
        
def generate_unique_badge_number():
    while True:
        OFF_ID = f"OFF-{generate_random()}"
        if not officers_collection.find_one({"badgeNumber": OFF_ID}):
            return OFF_ID
        
"""
#### CLIENT ROUTES  ####
"""

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
        limit = 5      
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
                "id" : str(application.get("_id")),
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
                file_path = save_file(file)
                saved_files[key] = "NULL" if not file_path else file_path

        
        application_id = generate_unique_application_id()
        
        now = datetime.now(cat_tz)
        application = {
            'applicationId': application_id,
            "ownerID": str(current_user.get("_id")),
            **form.to_dict(),
            'status': 'pending',
            'submittedDate': now.strftime('%Y-%m-%d'),
            'createdAt': now,
            'updatedAt': now,
            'uploadedFiles': saved_files,
            'timeline': [
                {
                    'status': 'submitted',
                    'date': now.strftime('%Y-%m-%d'),
                    'time': now.strftime('%H:%M'),
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

@app.route("/api/information", methods=["GET"])
@token_required
def get_client_information(current_user):
    id = str(current_user.get("_id"))
    if not id:
        return {"message": "Something happened"}, 401
    try:
        user = users_collection.find_one({"_id": ObjectId(id)})
        if user:
            return {
                "user": user.get("businessInformation", {}),
                "success": True
            }, 200

        return {
            "success": False,
            "message": "No user found"
        }, 401
    except Exception as error:
        app.logger.error(f"{error}")
        return {
            "success": False,
            "message": "An internal error occurred"
        }, 500  

""" 
#### ADMIN ROUTES 
"""
@app.route('/api/admin/dashboard', methods=['GET'])
@token_required
@admin_required
def get_admin_dashboard(admin):
    try:
        # Get total counts
        total_users = users_collection.count_documents({'role': {'$ne': 'admin'}})
        total_applications = applications_collection.count_documents({})
        total_pending_applications = applications_collection.count_documents({"status": {"$ne": "approved"}})
        total_vehicles = vehicles_collection.count_documents({"status": "approved"})
        total_officers = officers_collection.count_documents({})

        return jsonify({
            'success': True,
            'stats': {
                'totalOperators': total_users,
                'totalApplications': total_applications,
                'registeredVehicles': total_vehicles,
                'totalOfficers': total_officers,
                'pendingReviews': total_pending_applications
            }
        }), 200
    
    except Exception as e:
        print(f"Get admin dashboard error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/admin/operators', methods=['GET'])
@token_required
@admin_required
def get_operators(admin):
    try:
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = 10
         
        query = {
            'role': {'$ne': 'admin'},
        }
        if status and status != 'default':
            query['status'] = status
        
        if search:
            search_regex = {'$regex': search, '$options': 'i'}
            query['$or'] = [
                {'firstName': search_regex},
                {'lastName': search_regex},
                {'businessInformation.contactPerson': search_regex},
                {'businessInformation.companyName': search_regex},
                {'email': search_regex}
            ]
        
        skip = (page - 1) * limit
        operators = list(users_collection.find(query).skip(skip).limit(limit).sort('createdAt', 1))
        total = users_collection.count_documents(query)
        
        for operator in operators:
            operator["_id"] = str(operator.get("_id", ""))
    
            operator['activePermits'] = applications_collection.count_documents({
                'firstName': operator.get('firstName', ''),
                'lastName': operator.get('lastName', ''),
                'status': 'approved'
            })

            operator['vehicles'] = vehicles_collection.count_documents({
                'ownerID': operator["_id"]
            })

            operator.pop("password", None)
        
        total_pages = (total + limit - 1) // limit if total > 0 else 1
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
            'success': True,
            'operators': operators,
            "pagination": pagination
        }, 200
    
    except Exception as e:
        app.logger.error(f"{e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/operators/<operator_id>', methods=['PUT'])
@token_required
@admin_required
def update_operator(admin, operator_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No update data provided"}), 400

        update_fields = {}

        if "businessInformation" in data:
            for key, value in data["businessInformation"].items():
                update_fields[f"businessInformation.{key}"] = value

        for field in ["email", "phone", "status", "firstName", "lastName"]:
            if field in data:
                update_fields[field] = data[field]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        result = users_collection.update_one(
            {"_id": ObjectId(operator_id), "role": {"$ne": "admin"}},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Operator not found"}), 404

        updated_operator = users_collection.find_one({"_id": ObjectId(operator_id)})
        updated_operator["_id"] = str(updated_operator["_id"])
        updated_operator.pop("password", None)

        return jsonify({
            "success": True,
            "message": "Operator updated successfully",
            "operator": updated_operator
        }), 200

    except Exception as e:
        app.logger.error(f"Update operator error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/api/operators/<operator_id>", methods=["DELETE"])
@token_required
@admin_required
def delete_operator(admin, operator_id):
    try:
        operator = users_collection.find_one({"_id": ObjectId(operator_id)})
        if not operator:
            return jsonify({"error": "Operator not found"}), 404

        applications_collection.delete_many({"operatorId": operator_id})
        vehicles_collection.delete_many({"ownerID": operator_id})

        result = users_collection.delete_one({"_id": ObjectId(operator_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Operator not deleted"}), 400

        return jsonify({"message": "Operator deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/create", methods = ["POST"])
def create_admin():
    data = request.get_json()
    firstName = data.get("firstName", None)
    email = data.get("email", None)
    password = data.get("password", None)

    if not firstName and not password and not email:
        return {
            "success" : False,
            "message" : "firstName, email and Password required"
        }, 400
    
    hashedPassword = hash_password(password)
    adminDocument = {
        'firstName': firstName,
        'lastName': "Admin",
        'email': email,
        'phone': "123",
        'password': hashedPassword,
        'role': 'admin',
        'createdAt': datetime.now(cat_tz),
        'updatedAt': datetime.now(cat_tz)
    }
    try:
        admin = users_collection.insert_one(adminDocument)
        if admin.inserted_id:
            token_payload = generate_token(admin)

            return{
                "success" : True,
                "tokenPayload" : token_payload,
                "message" : "New admin created",
                "username" : firstName
            }, 200
        
    except Exception as e:
        app.logger.error(f"Error creating admin: {e}")
        return {
            "message" : "An error occurred"
        }, 500
    
@app.route('/api/admin/vehicles', methods=['GET'])
@token_required
@admin_required
def get_vehicles(admin):
    try:
        status = request.args.get('status')
        search = request.args.get("search", None)
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        query = {}
        if status and status != 'default':
            query['status'] = status

        if search:
            search_regex = {'$regex': search, '$options': 'i'}
            query['$or'] = [
                {'vehicleId': search_regex},
                {'registrationNumber': search_regex},
                {'make': search_regex},
                {'model': search_regex}
            ]
        skip = (page - 1) * limit
        vehicles = list(vehicles_collection.find(query).skip(skip).limit(limit).sort('createdAt', 1))
        total = vehicles_collection.count_documents(query)
        
        total_pages = (total + limit - 1) // limit if total > 0 else 1

        results = []
        for vehicle in vehicles:
            operator = users_collection.find_one({"_id" : ObjectId(vehicle.get("ownerID"))})
            trimmedVehicle = {
                "operatorName" : operator["businessInformation"]["companyName"],
                "id" : str(vehicle.get("_id")),
                "registrationNumber" : vehicle.get("registrationNumber"),
                "make" : vehicle.get("make"),
                "model" : vehicle.get("model"),
                "status" : vehicle.get("status"),
                "registrationDate" :str(vehicle.get("createdAt")),
                "driverName" : vehicle.get("driverName"),
                "capacity" : vehicle.get("capacity"),
                "operatingRoute": vehicle.get("operatingRoute")

            }
            results.append(trimmedVehicle)
    
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
            'success': True,
            'vehicles': results,
            "pagination":  pagination
        }, 200
    
    except Exception as e:
        app.logger.error(f"Get vehicles error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route("/api/admin/vehicle/<vehicle_id>", methods = ["GET"])
@token_required
@admin_required
def get_vehicle(admin, vehicle_id):
    try:
        vehicle = vehicles_collection.find_one({"_id": ObjectId(vehicle_id)})
    except InvalidId:
        return {
            "success": False,
            "message": "Invalid vehicle ID"
        }, 400 
    
    if not vehicle:
        return {
            "success": False,
            "message": "Vehicle not found"
        }, 404 
    
    vehicle = serialize_application(vehicle)
    return {
        "success": True,
        "vehicle": vehicle
    }, 200

@app.route('/api/admin/update/<vehicle_id>', methods=['PUT'])
@token_required
@admin_required
def update_vehicle(admin, vehicle_id):
    try:
        data = request.get_json()
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        update_data = {
            'status': data.get('status', vehicle['status']),
            'operatingRoute': data.get('operatingRoute', vehicle['operatingRoute']),
            'driverName': data.get('driverName', vehicle['driverName']),
            'driverLicenseNumber': data.get('driverLicenseNumber', vehicle['driverLicenseNumber']),
            'driverLicenseExpiry': data.get('driverLicenseExpiry', vehicle['driverLicenseExpiry']),
            'insuranceExpiryDate': data.get('insuranceExpiryDate', vehicle['insuranceExpiryDate']),
            'roadworthyExpiryDate': data.get('roadworthyExpiryDate', vehicle['roadworthyExpiryDate']),
            'updatedAt': datetime.now(cat_tz)
        }
        
        vehicles_collection.update_one(
            {'_id': ObjectId(vehicle_id)},
            {'$set': update_data}
        )
        
        return {
            'success': True,
            'message': 'Vehicle updated successfully'
        }
    
    except Exception as e:
        app.logger.error(f"{e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/vehicles/<vehicle_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_vehicle(admin, vehicle_id):
    try:
        vehicle = vehicles_collection.find_one({'_id': ObjectId(vehicle_id)})
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404

        if vehicle['status'] == 'active':
            return jsonify({
                'error': 'Cannot delete active vehicle. Please change status first.'
            }), 400

        uploaded_files = vehicle.get('uploadedFiles', {})
        for key, file_path in uploaded_files.items():
            full_path = os.path.join(app.root_path, file_path)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"Failed to delete file {full_path}: {e}")

        vehicles_collection.delete_one({'_id': ObjectId(vehicle_id)})

        return jsonify({
            'success': True,
            'message': 'Vehicle and associated files deleted successfully'
        })

    except Exception as e:
        print(f"Delete vehicle error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/applications', methods=['GET'])
@token_required
@admin_required
def get_all_applications(admin):
    try:
        status = request.args.get('status')
        operator = request.args.get('operator')
        page = int(request.args.get('page', 1))
        limit = 10
        skip = (page - 1) * limit

        query = {}
        if status and status != 'default':
            query['status'] = status
        if operator:
            query['operatorName'] = {'$regex': operator, '$options': 'i'}

        total = applications_collection.count_documents(query)
        applications = list(applications_collection.find(query).skip(skip).limit(limit).sort('createdAt', -1))

        results = []
        for application in applications:

            trimmedApplication = {
                "id" : str(application.get("_id")),
                "status" : application.get("status"),
                "operatorName": application.get("operatorName"),
                "applicationId": application.get("applicationId"),
                "routeFrom": application.get("routeFrom"),
                "routeTo": application.get("routeTo"),
                "vehicleCount": application.get("vehicleCount"),
                "submittedDate": application.get("submittedDate"),
            }
            results.append(trimmedApplication)

        total_pages = (total + limit - 1) // limit if total > 0 else 1
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
            "results": results,
            "pagination": pagination
        }, 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/s/applications', methods=['GET'])
@token_required
@admin_required
def search_admin_application(admin):
    try:
        query = request.args.get("applicationId", "").strip()

        if not query:
            return jsonify({"error": "applicationId query parameter is required"}), 400

        applications = list(applications_collection.find(
            {"applicationId": {"$regex": query, "$options": "i"}}
        ).limit(10))

        if not applications:
            return jsonify({"message": "No applications found"}), 404

        results = []
        for application in applications:
            trimmedApplication = {
                "id" : str(application.get("_id")),
                "status" : application.get("status"),
                "operatorName": application.get("operatorName"),
                "applicationId": application.get("applicationId"),
                "routeFrom": application.get("routeFrom"),
                "routeTo": application.get("routeTo"),
                "vehicleCount": application.get("vehicleCount"),
                "submittedDate": application.get("submittedDate"),
            }
            results.append(trimmedApplication)

        return jsonify(results), 200

    except Exception as e:
        app.logger.error(f"An error occurred searching for application: {e}")
        return jsonify({"error": f"Error searching application: {str(e)}"}), 500

@app.route('/api/admin/application/<application_id>/status', methods=['PUT'])
@token_required
@admin_required
def update_application_status(admin, application_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        update_data = {
            'status': new_status,
            'updatedAt': datetime.now(cat_tz)
        }
        
        timeline_entry = {
            'status': new_status,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'time': datetime.now().strftime('%H:%M'),
            'description': f'Status updated to {new_status}',
            "completed" : True
        }
        
        applications_collection.update_one(
            {'_id': ObjectId(application_id)},
            {
                '$set': update_data,
                '$push': {'timeline': timeline_entry}
            }
        )
        
        return jsonify({'message': 'Status updated successfully'})
    
    except Exception as e:
        app.logger.error(f"Error updating status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route("/api/admin/create/officer", methods = ["PUT"])
@token_required
@admin_required
def create_officer(admin):
    data = request.get_json()
    
    required_fields = ["firstName", "lastName", "rank", "email", "phoneNumber", "department", "password"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'Missing required field: {field}'}), 400
    

    existing_officer = officers_collection.find_one({"email": data["email"]})
    if existing_officer:
        return {
            "isEmailRegistered" : True,
            "success": False,
            "message": "Email already exists"
        }, 400

    hashed_password = hash_password(data["password"])
    badgeNumber = generate_unique_badge_number()

    officer_doc = {
        "firstName"  : data["firstName"],
        "lastName" : data["lastName"],
        "email" : data["email"],
        "badgeNumber" : badgeNumber,
        "password" : hashed_password,
        "department" : data["department"],
        "phoneNumber" : data["phoneNumber"],
        "rank" : data["rank"],
        "status" : "active",
        "createdAt" :  datetime.now(cat_tz),
        "updatedAt" : datetime.now(cat_tz)
    }

    try:
        result = officers_collection.insert_one(officer_doc)
        if result.inserted_id:
            token = generate_token(result)

            officer_doc["_id"] = str(result.inserted_id)
            officer_doc["createdAt"] = officer_doc["createdAt"].isoformat()
            officer_doc["updatedAt"] = officer_doc["updatedAt"].isoformat()
            officer_doc.pop("password", None)

            return {
                "success": True,
                "message": "Officer created successfully",
                "token": token,
                "officer": officer_doc
            }, 200
        
    except Exception as e:
        app.logger.error("An error occurred creating officer: " + e)
        return {
            "message" : "An error occurred creating officer"
        }, 500

@app.route("/api/admin/officers", methods = ["GET"])
@token_required
@admin_required
def get_officers(admin):
    try:
        status = request.args.get('status')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = 10
         
        query = {}
        if status and status != 'default':
            query['status'] = status
        
        if search:
            search_regex = {'$regex': search, '$options': 'i'}
            query['$or'] = [
                {'firstName': search_regex},
                {'lastName': search_regex},
                {'badgeNumber': search_regex}
            ]
        
        skip = (page - 1) * limit
        officers = list(officers_collection.find(query).skip(skip).limit(limit).sort('createdAt', 1))
        total = officers_collection.count_documents(query)
        
        for officer in officers:
            officer["_id"] = str(officer.get("_id", ""))    
            officer.pop("password", None)
            officer.pop("updatedAt")

        total_pages = (total + limit - 1) // limit if total > 0 else 1
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
            'success': True,
            'officers': officers,
            "pagination": pagination
        }, 200
    
    except Exception as e:
        app.logger.error(f"{e}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route("/api/admin/officers/<officer_id>", methods=["PATCH"])
@token_required
@admin_required
def update_officer(admin, officer_id):
    try:
        data = request.get_json()
        
        allowed_fields = [
            "firstName", 
            "lastName", 
            "email", 
            "phoneNumber", 
            "rank", 
            "department", 
            "status"
        ]
        
        update_data = {field: data[field] for field in allowed_fields if field in data}
        
        if not update_data:
            return jsonify({"message": "No valid fields to update"}), 400
        
        update_data["updatedAt"] = datetime.now(cat_tz)

        result = officers_collection.update_one(
            {"_id": ObjectId(officer_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"message": "Officer not found"}), 404

        updated_officer = officers_collection.find_one({"_id": ObjectId(officer_id)})
        updated_officer["_id"] = str(updated_officer["_id"])
        updated_officer["createdAt"] = updated_officer["createdAt"].isoformat()
        updated_officer["updatedAt"] = updated_officer["updatedAt"].isoformat()
        updated_officer.pop("password", None)

        return {
            "success": True,
            "message": "Officer updated successfully",
            "officer": updated_officer
        }, 200

    except Exception as e:
        app.logger.error(f"Error updating officer: {str(e)}")
        return {"message": "Internal server error"}, 500

@app.route('/api/officers/<identifier>', methods=['DELETE'])
@token_required
@admin_required
def delete_officer(admin, identifier):
    try:
        result = None

        try:
            result = officers_collection.delete_one({"_id": ObjectId(identifier)})
        except Exception:
            result = None
        if not result or result.deleted_count == 0:
            result = officers_collection.delete_one({"badgeNumber": identifier})

        if result.deleted_count == 0:
            return jsonify({"error": "Officer not found"}), 404

        return jsonify({"message": "Officer deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/application/<application_id>', methods = ['PUT'])
@token_required
@admin_required
def edit_application(admin, application_id):
    try:
        data = request.get_json()
        data.pop("_id", None)
        now = datetime.now(cat_tz)
        new_timeline_entry = {
            "status": "edited",
            "description": "Application details updated",
            "date": now.strftime("%Y-%m-%d"),
            "time": now.strftime("%H:%M"),
            "completed": True
        }

        data["updatedAt"] = now.isoformat()
        if "timeline" in data:
            del data["timeline"]

        result = applications_collection.update_one(
            {"_id": ObjectId(application_id)},
            {
                "$set": data,
                "$push": {"timeline": new_timeline_entry}
            }
        )

        if result.matched_count == 0:
            return jsonify({"error": "Application not found"}), 404

        return jsonify({"message": "Application updated successfully"}), 200

    except Exception as e:
        app.logger.error1(f"An Error occurred: {e}")
        return jsonify({"error": f"Error editing application: {str(e)}"}), 500

@app.route('/api/admin/applications/<application_id>', methods = ['DELETE'])
@token_required
@admin_required
def delete_application(admin, application_id):
    try:
        application = applications_collection.find_one({"applicationId": application_id})
        if not application:
            return jsonify({"error": "Application not found"}), 404

        uploaded_files = application.get("uploadedFiles", {})
        for key, file_path in uploaded_files.items():
            full_path = os.path.join(app.root_path, file_path)
            if os.path.exists(full_path):
                try:
                    os.remove(full_path)
                except Exception as e:
                    print(f"Failed to delete file {full_path}: {e}")

        result = applications_collection.delete_one({"applicationId": application_id})

        return jsonify({"message": "Application and associated files deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Error deleting application: {str(e)}"}), 500
    
@app.route("/api/admin/s/operator", methods = ["GET"])
@token_required
@admin_required
def get_operator(admin):
    query = request.args.get("query", None)
    if not query:
        return {
            "success" : False,
            "message" : "Query required"
        }   
    try:
        operators = list(users_collection.find({
                "businessInformation" : {
                    "companyName" : {
                        "$regex": f"{query}",
                        "$options": "i"
                    }
                }
        }).limit(5))

        results = []
        for operator in operators:
            operator_ = {
                "id" : str(operator.get("_id")),
                "Company Name" : operator.get("businessInformation", {}).get("companyName", "")
            }
            results.append(operator_)
        
        return {
            "success" : True,
            "results" : results
        }
    except Exception as e:
        app.logger.error(f"Error occurred fetching operators : {e}")
        return {
            "message" : "Error occurred"
        }, 500

@app.route('/api/admin/violations/<violation_id>/pay', methods=['PATCH'])
@token_required
@admin_required
def mark_violation_paid(admin, violation_id):
    try:
        violation = violations_collection.find_one({"_id": ObjectId(violation_id)})
        
        if not violation:
            return jsonify({"error": "Violation not found"}), 404

        if violation.get("status") == "paid":
            return jsonify({"message": "Violation already marked as paid"}), 200

        result = violations_collection.update_one(
            {"_id": ObjectId(violation_id)},
            {"$set": {"status": "paid"}}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Failed to update violation"}), 500

        return jsonify({
            "message": "Violation marked as paid successfully",
            "violationId": violation_id,
            "status": "paid"
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@app.route('/api/admin/violations', methods=['GET'])
@token_required
@admin_required
def get_violations(admin):
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        skip = (page - 1) * limit

        total = violations_collection.count_documents({})
        violations_cursor = violations_collection.find().sort("date", -1).skip(skip).limit(limit)

        violations = []
        for v in violations_cursor:
            officer = officers_collection.find_one({"_id": ObjectId(v.get("officer_id"))})
            vehicle_owner = ""
            plate = ""
            try:
                vehicle = vehicles_collection.find_one({"_id": ObjectId(v.get("vehicle_id"))})
                if vehicle:
                    owner = users_collection.find_one({"_id": ObjectId(vehicle.get("ownerID"))})
                    plate = owner.get("registrationNumber")
                    if owner:
                        vehicle_owner = f"{owner.get('firstName', '')} {owner.get('lastName', '')}".strip()
            
            except InvalidId:
                vehicle_owner = "Not registered"

            violations.append({
                "_id": str(v["_id"]),
                "plate" : v.get("plate", plate),
                "vehicle_owner": vehicle_owner,
                "officer_name": f"{officer.get('firstName', '')} {officer.get('lastName', '')}" if officer else "N/A",
                "violation": v.get("violation"),
                "fine": v.get("fine"),
                "date": v.get("date"),
                "status": v.get("status", "unpaid")
            })

        total_pages = (total + limit - 1) // limit if total > 0 else 1
        pagination = {
            "current_page": page,
            "total_pages": total_pages,
            "total_items": total,
            "has_previous": page > 1,
            "has_next": page < total_pages,
            "previous_page": page - 1 if page > 1 else None,
            "next_page": page + 1 if page < total_pages else None,
        }

        return jsonify({
            "violations": violations,
            "success": True,
            "pagination": pagination
        }), 200

    except Exception as e:
        app.logger.error(f"Error fetching violations: {str(e)}")
        return jsonify({"error": str(e)}), 500


"""
#### OFFICER ROUTES
"""
@app.route("/api/officer/auth", methods = ["POST"])
def officer_login():
    data = request.get_json()
    badgeNumber = data.get("badgeNumber", None)
    password = data.get("password", None)

    if not badgeNumber and not password:
        return {
            "message" : "Officer badge and password needed"
        }
    try: 
        officer = officers_collection.find_one({"badgeNumber" : badgeNumber})
        if not officer:
            return {
                "message" : "Badge Number not found",
                "isAuth" : False,
            }, 401

        if not bcrypt.checkpw(password.encode('utf-8'), officer['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
            
        token = generate_token(officer)
        officers_collection.update_one(
            {'_id': officer['_id']},
            {'$set': {'lastLogin': datetime.now(cat_tz)}}
        )
        
        officer_data = {
            '_id': str(officer['_id']),
            'badgeNumber' : officer["badgeNumber"],
            'email': officer['email'],
            'firstName': officer.get('firstName'),
            'lastName': officer.get('lastName'),
            'role': "officer"
        }
        
        return jsonify({
            'success': True,
            'token': token,
            'officer': officer_data,
            'message': 'Login successful'
        })


    except Exception as e:
        return {
            "success" : False,
            "message" : "An error occurred"
        }, 500

@app.route("/api/officer/search", methods=["GET"])
@officer_required
def search_license(current_user):
    reg_number = request.args.get("plate")
    if not reg_number:
        return jsonify({"error": "License plate number is required"}), 400

    vehicle = vehicles_collection.find_one({"registrationNumber": reg_number.upper()})
    if not vehicle:
        return jsonify({
            "licensePlate": reg_number.upper(),
            "status": "not_found",
            "operatorName": "Not Found",
            "contactPerson": "N/A",
            "vehicleModel": "N/A",
            "capacity": 0,
            "route": "N/A",
            "permitNumber": "N/A",
            "phone": "N/A",
            "permitExpiry": "N/A",
            "lastInspection": "N/A",
            "insuranceExpiry": "N/A",
            "roadworthyExpiry": "N/A",
            "violations": []
        }), 404

    operator = users_collection.find_one({"_id": ObjectId(vehicle.get("ownerID"))})

    violations_cursor = violations_collection.find({"vehicle_id": vehicle["_id"]})
    violations = []
    for v in violations_cursor:
        violations.append({
            "id": str(v["_id"]),
            "officer_id": str(v["officer_id"]),
            "violation": v["violation"],
            "fine": v["fine"],
            "date": v["date"],
            "status": v.get("status", "unpaid")
        })

    response = {
        "vehicleID": str(vehicle["_id"]),
        "licensePlate": vehicle["registrationNumber"],
        "status": vehicle.get("status", "unknown"),
        "operatorName": f"{operator.get('firstName')} {operator.get('lastName')}",
        "contactPerson": vehicle.get("driverName", "N/A"),
        "vehicleModel": f"{vehicle.get('make', '')} {vehicle.get('model', '')}".strip(),
        "capacity": vehicle.get("capacity", 0),
        "phone": operator["businessInformation"].get("contactPerson", "N/A"),
        "route": vehicle.get("operatingRoute", "N/A"),
        "permitNumber": vehicle.get("vehicleId", "N/A"),
        "permitExpiry": vehicle.get("driverLicenseExpiry", "N/A"),
        "lastInspection": vehicle.get("registrationDate", "N/A"),
        "insuranceExpiry": vehicle.get("insuranceExpiryDate", "N/A"),
        "roadworthyExpiry": vehicle.get("roadworthyExpiryDate", "N/A"),
        "violations": violations
    }
    return jsonify(response), 200

@app.route("/api/officer/violations/<vehicle_id>", methods=["POST"])
@officer_required
def add_violation(officer, vehicle_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing violation data"}), 400
    try:
        V_ID =  ObjectId(vehicle_id)
    except InvalidId:
        V_ID = vehicle_id

    violation = {
        "_id": ObjectId(),
        "vehicle_id": V_ID,
        "officer_id": ObjectId(officer.get("_id")),
        "violation": data.get("violation"),
        "fine": data.get("fine"),
        "plate" : data.get("plate", ""),
        "date": datetime.now(cat_tz).strftime("%Y-%m-%d"),
        "status": "unpaid",
    }

    result = violations_collection.insert_one(violation)

    if not result.inserted_id:
        return jsonify({"error": "Failed to save violation"}), 500

    violation["id"] = str(violation["_id"])
    violation["vehicle_id"] = str(violation["vehicle_id"])
    violation["officer_id"] = str(violation["officer_id"])
    del violation["_id"]

    return jsonify({"message": "Violation added", "violation": violation}), 201


"""
#### UNIVERSAL ROUTES
"""

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
        
        vehicle_id = generate_unique_vehicle_id()

        saved_files = {}
        for key in ['vehicleDocuments', 'insuranceCertificates', 'driversLicenses']:
            file = files.get(key)
            if file:
                file_path = save_file(file)
                saved_files[key] = "NULL" if not file_path else file_path

        vehicle_doc = {
            "ownerID" : str(current_user.get('_id')) if  current_user.get("role") == "operator" else form["ownerID"],
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
            'status': 'under_review',
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
    
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        mode = request.args.get("mode", None)
        
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'accountType']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
   
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'message': 'Email address already registered'}), 409

        if users_collection.find_one({
            "businessInformation" : {
                "companyName" : data["companyName"]
            }
        }):
            return jsonify({'message': 'Company name already registered'}), 409 
        
        password_hash = hash_password(data['password'])
        
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
                "contactPerson" : data.get("contactPerson", "")
            },
            "status" : "active",
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
            "_id": str(user.get("_id", "")),
            "email": user.get("email", ""),
            "firstName": user.get("firstName", ""),
            "lastName": user.get("lastName", ""),
            "role": user.get("role", ""),
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
