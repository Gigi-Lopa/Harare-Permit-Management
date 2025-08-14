# Enhanced Flask backend with authentication for the Permit Management System

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
import bcrypt
import jwt
from functools import wraps
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
import secrets
import re

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
app.config['DATABASE_NAME'] = 'permit_management'
app.config['SMTP_SERVER'] = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
app.config['SMTP_PORT'] = int(os.getenv('SMTP_PORT', '587'))
app.config['EMAIL_USER'] = os.getenv('EMAIL_USER', 'noreply@harare.gov.zw')
app.config['EMAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD', 'your-email-password')

# MongoDB connection
client = MongoClient(app.config['MONGODB_URI'])
db = client[app.config['DATABASE_NAME']]

# Collections
users_collection = db.users
applications_collection = db.applications
vehicles_collection = db.vehicles
operators_collection = db.operators
routes_collection = db.routes
password_resets_collection = db.password_resets
admin_requests_collection = db.admin_requests

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]  # Remove 'Bearer ' prefix
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
            if current_user.get('status') != 'active':
                return jsonify({'message': 'Account is not active'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        except Exception as e:
            return jsonify({'message': 'Token validation failed'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # At least 8 characters, one uppercase, one lowercase, one digit
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def send_email(to_email, subject, body, is_html=False):
    try:
        msg = MimeMultipart()
        msg['From'] = app.config['EMAIL_USER']
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MimeText(body, 'html' if is_html else 'plain'))
        
        server = smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT'])
        server.starttls()
        server.login(app.config['EMAIL_USER'], app.config['EMAIL_PASSWORD'])
        text = msg.as_string()
        server.sendmail(app.config['EMAIL_USER'], to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

def send_verification_email(email, user_id):
    verification_token = secrets.token_urlsafe(32)
    
    # Store verification token in database
    users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {'verification_token': verification_token}}
    )
    
    verification_link = f"http://localhost:3000/auth/verify-email?token={verification_token}"
    
    subject = "Verify Your Email - Harare City Council Permit System"
    body = f"""
    <html>
    <body>
        <h2>Welcome to Harare City Council Permit Management System</h2>
        <p>Thank you for registering with our permit management system.</p>
        <p>Please click the link below to verify your email address:</p>
        <p><a href="{verification_link}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>Harare City Council</p>
    </body>
    </html>
    """
    
    return send_email(email, subject, body, is_html=True)

def send_password_reset_email(email, reset_token):
    reset_link = f"http://localhost:3000/auth/reset-password?token={reset_token}"
    
    subject = "Password Reset - Harare City Council Permit System"
    body = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password for the Harare City Council Permit Management System.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="{reset_link}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Harare City Council</p>
    </body>
    </html>
    """
    
    return send_email(email, subject, body, is_html=True)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Extract and validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'accountType']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Check if email already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'message': 'Email address already registered'}), 409
        
        # Validate password
        if data['password'] != data['confirmPassword']:
            return jsonify({'message': 'Passwords do not match'}), 400
        
        is_valid, password_message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'message': password_message}), 400
        
        # Validate terms agreement
        if not data.get('agreeToTerms') or not data.get('agreeToPrivacy'):
            return jsonify({'message': 'You must agree to the terms and privacy policy'}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user_doc = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': data['email'].lower(),
            'phone': data['phone'],
            'password': password_hash,
            'role': 'admin' if data['accountType'] == 'admin' else 'operator',
            'status': 'pending' if data['accountType'] == 'admin' else 'active',
            'emailVerified': False,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        # Add business information for operators
        if data['accountType'] == 'operator':
            if not data.get('companyName') or not data.get('businessAddress'):
                return jsonify({'message': 'Company name and business address are required for operators'}), 400
            
            user_doc.update({
                'companyName': data['companyName'],
                'businessRegistration': data.get('businessRegistration', ''),
                'businessAddress': data['businessAddress'],
                'contactPerson': data.get('contactPerson', '')
            })
        
        if data['accountType'] == 'admin':
            # Create admin request instead of direct user creation
            admin_request = {
                **user_doc,
                'department': data.get('department', 'Pending Assignment'),
                'requestDate': datetime.utcnow(),
                'status': 'pending'
            }
            
            result = admin_requests_collection.insert_one(admin_request)
            
            # Notify existing admins about new request
            admin_users = users_collection.find({'role': 'admin', 'status': 'active'})
            for admin in admin_users:
                # Send notification email to existing admins
                pass
            
            return jsonify({
                'success': True,
                'message': 'Admin account request submitted successfully. Your account will be reviewed by existing administrators.',
                'requiresApproval': True
            }), 201
        else:
            # Create operator account directly
            result = users_collection.insert_one(user_doc)
            user_id = str(result.inserted_id)
            
            # Send verification email
            if send_verification_email(data['email'], user_id):
                return jsonify({
                    'success': True,
                    'message': 'Account created successfully! Please check your email to verify your account.',
                    'userId': user_id
                }), 201
            else:
                return jsonify({
                    'success': True,
                    'message': 'Account created successfully! However, verification email could not be sent.',
                    'userId': user_id
                }), 201
    
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        password = data.get('password', '')
        user_type = data.get('userType', 'client')
        
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Check account status
        if user.get('status') != 'active':
            if user.get('status') == 'pending':
                return jsonify({'message': 'Account is pending approval'}), 403
            else:
                return jsonify({'message': 'Account is not active. Please contact support.'}), 403
        
        # Check user type permissions
        if user_type == 'admin' and user.get('role') != 'admin':
            return jsonify({'message': 'Access denied. Admin credentials required.'}), 403
        
        if user_type == 'client' and user.get('role') == 'admin':
            return jsonify({'message': 'Please use admin login for administrator accounts.'}), 403
        
        # Generate JWT token
        token_payload = {
            'user_id': str(user['_id']),
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')
        
        # Update last login
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'lastLogin': datetime.utcnow()}}
        )
        
        # Return user data (excluding password)
        user_data = {
            'id': str(user['_id']),
            'email': user['email'],
            'firstName': user.get('firstName'),
            'lastName': user.get('lastName'),
            'role': user['role'],
            'companyName': user.get('companyName'),
            'emailVerified': user.get('emailVerified', False)
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

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        # Check if user exists
        user = users_collection.find_one({'email': email})
        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({
                'success': True,
                'message': 'If an account with this email exists, a password reset link has been sent.'
            })
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Store reset token
        password_resets_collection.insert_one({
            'userId': user['_id'],
            'token': reset_token,
            'expiresAt': expires_at,
            'used': False,
            'createdAt': datetime.utcnow()
        })
        
        # Send reset email
        if send_password_reset_email(email, reset_token):
            return jsonify({
                'success': True,
                'message': 'Password reset link has been sent to your email.'
            })
        else:
            return jsonify({'message': 'Failed to send reset email. Please try again.'}), 500
    
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        confirm_password = data.get('confirmPassword')
        
        if not token or not new_password or not confirm_password:
            return jsonify({'message': 'All fields are required'}), 400
        
        if new_password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400
        
        # Validate password strength
        is_valid, password_message = validate_password(new_password)
        if not is_valid:
            return jsonify({'message': password_message}), 400
        
        # Find reset token
        reset_record = password_resets_collection.find_one({
            'token': token,
            'used': False,
            'expiresAt': {'$gt': datetime.utcnow()}
        })
        
        if not reset_record:
            return jsonify({'message': 'Invalid or expired reset token'}), 400
        
        # Hash new password
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update user password
        users_collection.update_one(
            {'_id': reset_record['userId']},
            {
                '$set': {
                    'password': password_hash,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        
        # Mark reset token as used
        password_resets_collection.update_one(
            {'_id': reset_record['_id']},
            {'$set': {'used': True, 'usedAt': datetime.utcnow()}}
        )
        
        return jsonify({
            'success': True,
            'message': 'Password has been reset successfully. You can now log in with your new password.'
        })
    
    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'message': 'Verification token is required'}), 400
        
        # Find user with verification token
        user = users_collection.find_one({'verification_token': token})
        if not user:
            return jsonify({'message': 'Invalid verification token'}), 400
        
        # Update user as verified
        users_collection.update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'emailVerified': True,
                    'updatedAt': datetime.utcnow()
                },
                '$unset': {'verification_token': ''}
            }
        )
        
        return jsonify({
            'success': True,
            'message': 'Email verified successfully! You can now use all features of your account.'
        })
    
    except Exception as e:
        print(f"Email verification error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

# Admin Routes for Managing Admin Requests
@app.route('/api/admin/requests', methods=['GET'])
@token_required
@admin_required
def get_admin_requests(current_user):
    try:
        requests = list(admin_requests_collection.find({'status': 'pending'}))
        
        for req in requests:
            req['_id'] = str(req['_id'])
            req.pop('password', None)  # Remove password from response
        
        return jsonify({'requests': requests})
    
    except Exception as e:
        print(f"Get admin requests error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/admin/requests/<request_id>/approve', methods=['POST'])
@token_required
@admin_required
def approve_admin_request(current_user, request_id):
    try:
        # Find the admin request
        admin_request = admin_requests_collection.find_one({'_id': ObjectId(request_id)})
        if not admin_request:
            return jsonify({'message': 'Admin request not found'}), 404
        
        # Create user account
        user_doc = {
            'firstName': admin_request['firstName'],
            'lastName': admin_request['lastName'],
            'email': admin_request['email'],
            'phone': admin_request['phone'],
            'password': admin_request['password'],
            'role': 'admin',
            'status': 'active',
            'emailVerified': True,  # Auto-verify admin accounts
            'department': admin_request.get('department', 'General'),
            'approvedBy': current_user['_id'],
            'approvedAt': datetime.utcnow(),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        users_collection.insert_one(user_doc)
        
        # Update admin request status
        admin_requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'approved',
                    'approvedBy': current_user['_id'],
                    'approvedAt': datetime.utcnow()
                }
            }
        )
        
        # Send approval email
        subject = "Admin Account Approved - Harare City Council"
        body = f"""
        <html>
        <body>
            <h2>Admin Account Approved</h2>
            <p>Dear {admin_request['firstName']} {admin_request['lastName']},</p>
            <p>Your administrator account request has been approved!</p>
            <p>You can now log in to the system using your email address and password.</p>
            <p><a href="http://localhost:3000/auth/login">Login to System</a></p>
            <p>Best regards,<br>Harare City Council</p>
        </body>
        </html>
        """
        
        send_email(admin_request['email'], subject, body, is_html=True)
        
        return jsonify({
            'success': True,
            'message': 'Admin request approved successfully'
        })
    
    except Exception as e:
        print(f"Approve admin request error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/admin/requests/<request_id>/reject', methods=['POST'])
@token_required
@admin_required
def reject_admin_request(current_user, request_id):
    try:
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        
        # Find the admin request
        admin_request = admin_requests_collection.find_one({'_id': ObjectId(request_id)})
        if not admin_request:
            return jsonify({'message': 'Admin request not found'}), 404
        
        # Update admin request status
        admin_requests_collection.update_one(
            {'_id': ObjectId(request_id)},
            {
                '$set': {
                    'status': 'rejected',
                    'rejectedBy': current_user['_id'],
                    'rejectedAt': datetime.utcnow(),
                    'rejectionReason': reason
                }
            }
        )
        
        # Send rejection email
        subject = "Admin Account Request - Harare City Council"
        body = f"""
        <html>
        <body>
            <h2>Admin Account Request Update</h2>
            <p>Dear {admin_request['firstName']} {admin_request['lastName']},</p>
            <p>Thank you for your interest in becoming an administrator for the Harare City Council Permit Management System.</p>
            <p>After careful review, we are unable to approve your administrator account request at this time.</p>
            <p><strong>Reason:</strong> {reason}</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>Harare City Council</p>
        </body>
        </html>
        """
        
        send_email(admin_request['email'], subject, body, is_html=True)
        
        return jsonify({
            'success': True,
            'message': 'Admin request rejected successfully'
        })
    
    except Exception as e:
        print(f"Reject admin request error: {str(e)}")
        return jsonify({'message': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
