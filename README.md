# HealthPal - Digital Healthcare Platform


**A comprehensive RESTful API platform designed to provide Palestinians with access to medical support, remote consultations, medicine coordination, and donation-driven treatment sponsorships.**


---

##  Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Technology Justification](#technology-justification)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**HealthPal** is a comprehensive digital healthcare platform designed to address the critical healthcare challenges faced by Palestinians. The platform bridges patients, doctors, donors, and medical NGOs to help overcome the collapse or inaccessibility of local healthcare systems.

### Problem Statement

In regions with limited healthcare infrastructure, Palestinians face significant barriers to accessing quality medical care:
- Limited access to medical consultations
- Financial constraints preventing treatment
- Medication and equipment shortages
- Lack of mental health support
- Fragmented healthcare information

### Solution

HealthPal provides a unified platform that:
- Enables remote medical consultations with local and international doctors
- Facilitates transparent medical sponsorship and donations
- Coordinates medication and equipment distribution
- Provides mental health and trauma support
- Delivers health education and public health alerts
- Integrates with NGOs and medical missions

---

## Technology Stack

### Backend Framework
- **Node.js** (v18+) - JavaScript runtime environment
- **Express.js** (v4.21) - Web application framework

### Database
- **MySQL 8.0** - Relational database management system
- **mysql2** - MySQL client for Node.js with Promise support

### Authentication & Security
- **JSON Web Tokens (JWT)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

### Validation & Utilities
- **express-validator** - Request validation middleware
- **multer** - File upload handling
- **moment** - Date manipulation
- **uuid** - Unique identifier generation

### Communication
- **Socket.io** - Real-time bidirectional communication
- **Nodemailer** - Email service integration

### Development Tools
- **Postman** - API testing and documentation
- **Nodemon** - Development server auto-reload

### DevOps & Deployment
- **Docker** - Containerization for easy deployment
- **Docker Compose** - Multi-container orchestration (API, MySQL, phpMyAdmin)

---

## Technology Justification

### Why Node.js & Express.js?

#### 1. **Development Efficiency**
- **Rapid Development**: JavaScript ecosystem allows for fast prototyping and development
- **Single Language**: Full-stack JavaScript reduces context switching
- **Rich Ecosystem**: NPM provides extensive libraries for healthcare-specific needs
- **Asynchronous I/O**: Non-blocking operations ideal for handling multiple concurrent requests (consultations, donations, alerts)

#### 2. **Scalability**
- **Event-Driven Architecture**: Handles high concurrency efficiently
- **Horizontal Scaling**: Easy to scale across multiple servers
- **Connection Pooling**: MySQL connection pooling handles database load efficiently

#### 3. **Security**
- **Mature Security Libraries**: Helmet, express-validator, JWT provide robust security
- **Regular Updates**: Active security patches and community support
- **Input Validation**: Built-in validation middleware prevents injection attacks
- **Token-Based Auth**: Stateless JWT authentication for distributed systems

#### 4. **Maintainability**
- **Modular Architecture**: Clear separation of concerns (routes, controllers, models)
- **Code Reusability**: Middleware and utility functions promote DRY principles
- **Comprehensive Testing**: Jest and Supertest enable thorough testing

#### 5. **API Development**
- **RESTful Design**: Express.js naturally supports REST architecture
- **Middleware Ecosystem**: Rich middleware for logging, error handling, validation
- **Postman Testing**: Easy API testing and documentation with Postman
- **Real-time Support**: Socket.io integration for live consultations and notifications

#### 6. **Community & Support**
- **Large Community**: Extensive documentation and community support
- **Healthcare Libraries**: Existing libraries for medical data handling
- **Best Practices**: Well-established patterns for API development

### Why MySQL?

#### 1. **Relational Data Structure**
- **Complex Relationships**: Healthcare data has intricate relationships (patients, doctors, consultations, donations)
- **Data Integrity**: Foreign keys and constraints ensure referential integrity
- **Transaction Support**: Critical for financial transactions (donations) and medical records

#### 2. **Performance**
- **Optimized Queries**: Efficient for complex joins and aggregations
- **Indexing**: Fast lookups for user searches, medical case queries
- **Connection Pooling**: Handles concurrent database connections efficiently

#### 3. **Maturity & Reliability**
- **Battle-Tested**: Proven reliability for production healthcare systems
- **Data Security**: Robust security features for sensitive medical data
- **Backup & Recovery**: Comprehensive backup solutions

#### 4. **Compliance**
- **Audit Logging**: Built-in logging capabilities for audit trails
- **Data Encryption**: Support for encrypted connections and data at rest

### Why Not Other Technologies?

#### Django (Python)
- **Slower Development**: More verbose for API-only projects
- **Less Flexible**: Django's ORM is opinionated, limiting flexibility
- **Deployment Complexity**: More complex deployment compared to Node.js

#### Spring Boot (Java)
- **Heavier Framework**: More boilerplate code
- **Slower Startup**: Longer development iteration cycles
- **Resource Intensive**: Higher memory footprint

---

## Architecture

### System Architecture

The application follows a three-layer architecture:

1. **Client Layer**: Web frontend, mobile apps, and third-party integrations
2. **Application Layer**: Express.js server with routes, controllers, middleware, and models
3. **Data Layer**: MySQL database with connection pooling and file storage

### Application Architecture Pattern

**MVC (Model-View-Controller) Pattern**

```
src/
├── routes/          # Route definitions (URL endpoints)
├── controllers/     # Business logic and request handling
├── models/          # Database queries and data access
├── middleware/      # Authentication, validation, logging
├── utils/           # Helper functions and utilities
└── config/          # Configuration files (database, constants)
```

### Request Flow

1. Client sends HTTP request to Express.js server
2. Middleware processes request (security, CORS, authentication, validation)
3. Route handler calls appropriate controller
4. Controller uses model to interact with MySQL database
5. Response is sent back to client in JSON format


---

## Core Features

### 1. Remote Medical Consultations
- Virtual clinic access with local and international doctors
- Multi-specialty support (general practice, pediatrics, mental health)
- Low-bandwidth mode (audio-only calls, asynchronous messaging)
- Medical translation support (Arabic ↔ English)
- Real-time messaging during consultations

### 2. Medical Sponsorship System
- Transparent donation tracking for medical treatments
- Support for surgeries, cancer treatments, dialysis, rehabilitation
- Patient profiles with verified medical history
- Donation goals and progress tracking
- Transparency dashboard with invoices and receipts

### 3. Medication & Equipment Coordination
- Medicine delivery matching system
- Equipment registry (oxygen tanks, wheelchairs, dialysis machines)
- Crowdsourced inventory from pharmacies and hospitals
- Request fulfillment tracking
- Delivery status updates

### 4. Health Education & Public Health Alerts
- Localized health guides in Arabic
- Visual guides for first aid, chronic illness management
- Real-time public health alerts
- Disease outbreak notifications
- Online workshops and webinars

### 5. Mental Health & Trauma Support
- Trauma counseling portal
- Support groups for patients and families
- Anonymous therapy chat
- PTSD and grief support
- Moderated community spaces

### 6. Partnerships with NGOs & Medical Missions
- Verified NGO network integration
- Mission scheduling for volunteer doctors
- Surgical missions tracker
- Mobile clinic coordination

### 7. User Management & Roles
- Multi-role system (Patient, Doctor, Donor, NGO, Pharmacy, Admin)
- Role-based permissions
- User verification system
- Profile management

### 8. System Administration
- API logging and monitoring
- System statistics dashboard
- Notification system
- File upload management

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### API Endpoints

#### 1. Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user and return JWT | No |
| POST | `/auth/logout` | Logout user / invalidate token | Yes |
| POST | `/auth/refresh` | Refresh JWT token | Yes |

#### 2. Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/users` | List all users (admin only, supports pagination & filters) | Yes (Admin) |
| POST | `/users` | Create a new user | Yes (Admin) |
| GET | `/users/:user_id` | Get user profile | Yes |
| PATCH | `/users/:user_id` | Update user profile | Yes |
| DELETE | `/users/:user_id` | Delete user | Yes (Admin) |

#### 3. Roles & Permissions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/roles` | List all roles | Yes (Admin) |
| GET | `/roles/:role_id/permissions` | List permissions for a role | Yes (Admin) |
| POST | `/roles/:role_id/permissions` | Assign permission to a role | Yes (Admin) |
| PUT | `/roles/:role_id/permissions/:permission_id` | Update permission | Yes (Admin) |
| DELETE | `/roles/:role_id/permissions/:permission_id` | Remove permission from a role | Yes (Admin) |

#### 4. Patients

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/patients` | Create new patient | Yes |
| GET | `/patients/:patient_id` | Get patient details | Yes |
| PATCH | `/patients/:patient_id` | Update patient info | Yes |
| DELETE | `/patients/:patient_id` | Delete patient | Yes |
| GET | `/patients/:patient_id/profiles` | List patient fundraising profiles | Yes |

#### 5. Doctors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/doctors` | Add doctor | Yes (Admin) |
| GET | `/doctors/:doctor_id` | Get doctor profile | Yes |
| PATCH | `/doctors/:doctor_id` | Update doctor info | Yes |
| GET | `/doctors/:doctor_id/certifications` | List certifications | Yes |
| POST | `/doctors/:doctor_id/certifications` | Add certification | Yes |
| DELETE | `/doctors/:doctor_id/certifications/:cert_id` | Remove certification | Yes |

#### 6. NGOs & Staff

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/ngos` | Create NGO | Yes (Admin) |
| GET | `/ngos/:ngo_id` | Get NGO info | Yes |
| PATCH | `/ngos/:ngo_id` | Update NGO | Yes (Admin) |
| GET | `/ngos/:ngo_id/staff` | List staff members | Yes |
| POST | `/ngos/:ngo_id/staff` | Add staff member | Yes (Admin) |
| PATCH | `/ngos/:ngo_id/staff/:staff_id` | Update staff role/status | Yes (Admin) |

#### 7. Consultations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/consultations` | Schedule new consultation | Yes |
| GET | `/consultations/:consultation_id` | Get consultation details | Yes |
| PATCH | `/consultations/:consultation_id` | Update consultation | Yes |
| DELETE | `/consultations/:consultation_id` | Delete consultation | Yes |
| GET | `/consultations/:consultation_id/messages` | List messages | Yes |
| POST | `/consultations/:consultation_id/messages` | Send a message | Yes |

#### 8. Medical Cases

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/medical_cases` | Create new medical case | Yes |
| GET | `/medical_cases/:case_id` | Get medical case details | Yes |
| PATCH | `/medical_cases/:case_id` | Update medical case info | Yes |
| GET | `/medical_cases/:case_id/updates` | List updates | Yes |
| POST | `/medical_cases/:case_id/updates` | Add update | Yes |
| GET | `/medical_cases/:case_id/donations` | List donations for a case | Yes |

#### 9. Donations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/donations` | Make a donation | Yes |
| GET | `/donations/:donation_id` | Get donation details | Yes |
| PUT | `/donations/:donation_id` | Update donation | Yes (Admin) |
| DELETE | `/donations/:donation_id` | Delete donation | Yes (Admin) |

#### 10. Medication & Equipment

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/medical_inventory` | Add inventory item | Yes |
| GET | `/medical_inventory/:inventory_id` | Get inventory item | Yes |
| PATCH | `/medical_inventory/:inventory_id` | Update inventory item | Yes |
| POST | `/medication_requests` | Create request | Yes |
| GET | `/medication_requests/:request_id` | Get request details | Yes |
| PATCH | `/medication_requests/:request_id` | Update request | Yes |
| POST | `/delivery_matches` | Match request with inventory | Yes |
| PATCH | `/delivery_matches/:match_id` | Update delivery status | Yes |
| DELETE | `/delivery_matches/:match_id` | Delete delivery match | Yes |

#### 11. Mental Health & Support

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/mental_health_sessions` | Schedule session | Yes |
| GET | `/mental_health_sessions/:session_id` | Get session details | Yes |
| PATCH | `/mental_health_sessions/:session_id` | Update session status/notes | Yes |
| POST | `/support_groups` | Create support group | Yes |
| GET | `/support_groups/:group_id` | Get support group info | Yes |
| DELETE | `/support_groups/:group_id` | Delete support group | Yes |

#### 12. Health Content & Alerts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/health_content` | Create content | Yes (Admin) |
| GET | `/health_content/:content_id` | Get content | No |
| PATCH | `/health_content/:content_id` | Update content | Yes (Admin) |
| DELETE | `/health_content/:content_id` | Delete content | Yes (Admin) |
| POST | `/health_alerts` | Create alert | Yes (Admin) |
| GET | `/health_alerts/:alert_id` | Get alert | No |
| PATCH | `/health_alerts/:alert_id` | Update alert status/content | Yes (Admin) |
| DELETE | `/health_alerts/:alert_id` | Delete alert | Yes (Admin) |

#### 13. System / Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/notifications/:user_id` | List user notifications | Yes |
| PATCH | `/notifications/:notification_id/read` | Mark as read | Yes |
| POST | `/file_uploads` | Upload file | Yes |
| GET | `/file_uploads/:file_id` | Get file info | Yes |
| GET | `/api_logs` | List API logs (admin only, supports filters & pagination) | Yes (Admin) |
| GET | `/system/stats` | System statistics (donations, cases, users, etc.) | Yes (Admin) |
| DELETE | `/file_uploads/:file_id` | Delete file | Yes (Admin) |

### API Testing

API testing is done using **Postman**.

### Example API Request

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "password": "securePassword123",
    "phone_number": "+970591234567",
    "role_id": 1
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "securePassword123"
  }'
```

**Get patient details (with authentication):**
```bash
curl -X GET http://localhost:3000/api/patients/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL** (8.0 or higher)
- **Docker** and **Docker Compose** (optional, for containerized deployment)

### Installation

#### Option 1: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Advance-Software-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   
   The database schema is automatically created when using Docker. For local setup:
   ```bash
   # Create the database
   mysql -u root -p < database/init/schema.sql
   ```
   
   Or manually:
   ```sql
   mysql -u root -p
   source database/init/schema.sql
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000`

#### Option 2: Docker Setup (Recommended)

Using Docker ensures the database schema is automatically initialized when the container starts.

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Advance-Software-Project
   ```

2. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

   This will automatically:
   - Build the API container
   - Start MySQL database and initialize schema from `database/init/schema.sql`
   - Start phpMyAdmin for database management
   - Start the API server

   Services available at:
   - API server: `http://localhost:3000`
   - MySQL database: `localhost:3307`
   - phpMyAdmin: `http://localhost:8080`

3. **Stop containers**
   ```bash
   docker-compose down
   ```


## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=healthpal
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Important Notes

- **Never commit** the `.env` file to version control
- Use strong, random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`
- When using Docker, these variables can be set in `docker-compose.yml`
- The `.env` file should be listed in `.gitignore`

---

##  Project Structure

```
Advance-Software-Project/
│
├── database/
│   └── init/
│       └── schema.sql              # Database schema (auto-initialized with Docker)
│
├── public/                          # Frontend static files
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   └── *.css, *.js                 # Frontend assets
│
├── src/
│   ├── config/
│   │   ├── constants.js            # Application constants
│   │   └── database.js             # Database connection pool
│   │
│   ├── controllers/                # Business logic layer
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── PatientController.js
│   │   ├── DoctorController.js
│   │   ├── consultationsController.js
│   │   ├── medicalCaseController.js
│   │   ├── donationController.js
│   │   ├── medicalInventoryController.js
│   │   ├── medicationRequestController.js
│   │   ├── deliveryMatchController.js
│   │   ├── mentalHealthController.js
│   │   ├── supportGroupController.js
│   │   ├── ngoController.js
│   │   ├── staffController.js
│   │   ├── rolesController.js
│   │   ├── HealthContentController.js
│   │   ├── HealthAlertController.js
│   │   └── systemController.js
│   │
│   ├── middleware/
│   │   └── authenticateToken.js    # JWT authentication middleware
│   │
│   ├── models/                     # Data access layer
│   │   ├── users_DB.js
│   │   ├── auth_db.js
│   │   ├── PatientModel.js
│   │   ├── DoctorModel.js
│   │   ├── consultation.js
│   │   ├── medicalCaseModel.js
│   │   ├── donationModel.js
│   │   ├── medicalInventoryModel.js
│   │   ├── medicationRequestModel.js
│   │   ├── deliveryMatchModel.js
│   │   ├── mentalHealthModel.js
│   │   ├── supportGroupModel.js
│   │   ├── ngo.js
│   │   ├── staff.js
│   │   ├── roles_DB.js
│   │   ├── HealthContentModel.js
│   │   ├── HealthAlertModel.js
│   │   └── system.js
│   │
│   ├── routes/                     # API route definitions
│   │   ├── auth.js
│   │   ├── userRoutes.js
│   │   ├── patients.js
│   │   ├── doctors.js
│   │   ├── consultationsRoutes.js
│   │   ├── medicalCaseRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── medicalInventoryRoutes.js
│   │   ├── medicationRequestRoutes.js
│   │   ├── deliveryMatchRoutes.js
│   │   ├── mentalHealthRoutes.js
│   │   ├── supportGroupRoutes.js
│   │   ├── ngoRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── rolesRoutes.js
│   │   ├── healthContent.js
│   │   ├── healthAlerts.js
│   │   └── systemRoutes.js
│   │
│   └── utils/
│       ├── responseHelper.js       # Standardized API response helper
│       └── validation.js           # Validation utilities
│
├── uploads/                         # File upload directory
│
├── .env                            # Environment variables (create this)
├── .gitignore
├── Dockerfile                      # Docker container configuration
├── docker-compose.yml              # Docker Compose configuration
├── index.js                        # Application entry point
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

---

## Database Schema

### Core Tables

- **users** - User accounts and profiles
- **roles** - User roles (patient, doctor, donor, ngo, pharmacy, admin)
- **permissions** - System permissions
- **role_permissions** - Role-permission mapping

### Healthcare Tables

- **patients** - Patient medical information
- **patient_profiles** - Fundraising profiles for patients
- **doctors** - Doctor profiles and specializations
- **doctor_certifications** - Doctor certifications

### Consultation & Treatment

- **consultations** - Medical consultation records
- **consultation_messages** - Consultation chat messages
- **medical_cases** - Medical case records
- **medical_case_updates** - Case progress updates

### Donations & Sponsorship

- **donations** - Donation records
- **donation_transactions** - Transaction details

### Medication & Equipment

- **medical_inventory** - Available medications and equipment
- **medication_requests** - Medication requests
- **delivery_matches** - Request-inventory matching

### Mental Health

- **mental_health_sessions** - Therapy session records
- **support_groups** - Support group information

### NGOs & Organizations

- **ngos** - NGO profiles
- **ngo_staff** - NGO staff members

### Content & Alerts

- **health_content** - Educational health content
- **health_alerts** - Public health alerts

### System

- **notifications** - User notifications
- **file_uploads** - Uploaded file metadata
- **api_logs** - API request logs

### Entity Relationship Diagram

```
users ──┬── patients ─── patient_profiles
        │
        ├── doctors ─── doctor_certifications
        │
        └── ngo_staff ── ngos

consultations ─── consultation_messages
medical_cases ─── medical_case_updates
medical_cases ─── donations
medication_requests ─── delivery_matches ─── medical_inventory
```

---

## Security Features

### Authentication & Authorization

- **JWT-based Authentication**: Stateless token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Token Refresh**: Secure token refresh mechanism
- **Token Invalidation**: Logout functionality invalidates tokens

### Data Security

- **SQL Injection Prevention**: Parameterized queries using mysql2
- **Input Validation**: express-validator for request validation
- **Sensitive Data Encryption**: Passwords and tokens are hashed/encrypted

### API Security

- **Request Logging**: Morgan for HTTP request logging
- **Error Handling**: Secure error messages (no sensitive data exposure)
- **HTTPS Ready**: Configured for HTTPS in production

### Best Practices

- **Environment Variables**: Sensitive data stored in .env
- **Connection Pooling**: Secure database connection management
- **File Upload Validation**: Multer with file type and size restrictions

---

## Testing

### API Testing with Postman

API testing is performed using **Postman**. All endpoints have been tested and documented through Postman collections.

### Testing Approach

1. **Manual Testing**: All API endpoints are tested manually using Postman
2. **Request/Response Validation**: Verify request payloads and response formats
3. **Authentication Testing**: Test JWT token-based authentication
4. **Error Handling**: Test error responses and validation

### Tested Endpoints

-  Authentication endpoints (register, login, logout, refresh)
-  User CRUD operations
-  Role and permission management
-  Patient and doctor operations
-  Consultation booking
-  Donation processing
-  Medical case management
-  Error handling and input validation

---

## Deployment

### Production Considerations

1. **Environment Variables**
   - Use strong JWT secrets
   - Configure production database

2. **Database**
   - Use production MySQL instance
   - Enable SSL connections
   - Configure backups

3. **Security**
   - Enable HTTPS
   - Enable security headers

4. **Monitoring**
   - Monitor API performance

### Docker Deployment

```bash
# Build production image
docker build -t healthpal-api:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name healthpal-api \
  healthpal-api:latest
```

### Docker Compose Deployment

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment Options

- **Heroku**: Easy deployment
- **AWS**: EC2, RDS
- **Google Cloud**: Cloud Run, Cloud SQL
- **Azure**: App Service
- **DigitalOcean**: App Platform

---

## Contributing

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Write tests for new features
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Request code review


### Git Workflow

- **main**: Production-ready code
- **feature/**: Feature branches
- **bugfix/**: Bug fix branches

---
## License

This project is licensed under the MIT License.

--

## Team

**HealthPal Development Team**

- Waleed Rabi
- Nassar Barahmeh
- Sally Amjad
- Suha aburidi

---


##  Acknowledgments

- Dr. Amjad AbuHassan for project guidance
- Open-source community for excellent tools and libraries
- Healthcare professionals for domain expertise

---

## Project Status

**Current Version**: 1.0.0

**Status**: Stable - Open for improvements

**Last Updated**: 2025

---

<div align="center">



[⬆ Back to Top](#healthpal---digital-healthcare-platform)

</div>

