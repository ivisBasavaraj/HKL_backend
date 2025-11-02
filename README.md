# TrackPro Backend API

Complete backend API for TrackPro Manufacturing Operations Management System built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Role-based authentication (Admin, Supervisor, User)
- **Incoming Inspection**: Track inspection processes with image upload and timing
- **Finishing Operations**: Monitor tool usage and finishing processes
- **Quality Control**: Automated tolerance checking with measurements
- **Delivery Management**: Complete delivery tracking with proof of delivery
- **Dashboard Analytics**: Real-time statistics and reporting

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB service

4. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `PUT /api/users/:id/assign-task` - Assign task to user (Supervisor/Admin)
- `PUT /api/users/:id/unassign-task` - Unassign task from user (Supervisor/Admin)
- `PUT /api/users/:id/status` - Update user status (Admin only)

### Inspections
- `POST /api/inspections` - Create inspection record
- `GET /api/inspections` - Get all inspections (paginated)
- `GET /api/inspections/:id` - Get inspection by ID
- `PUT /api/inspections/:id` - Update inspection
- `DELETE /api/inspections/:id` - Delete inspection
- `GET /api/inspections/user/:userId` - Get inspections by user

### Finishing Operations
- `POST /api/finishing` - Create finishing record
- `GET /api/finishing` - Get all finishing records (paginated)
- `GET /api/finishing/:id` - Get finishing record by ID
- `PUT /api/finishing/:id` - Update finishing record
- `DELETE /api/finishing/:id` - Delete finishing record
- `GET /api/finishing/user/:userId` - Get finishing records by user
- `GET /api/finishing/stats/tools` - Get tool usage statistics

### Quality Control
- `POST /api/quality` - Create QC record
- `GET /api/quality` - Get all QC records (paginated)
- `GET /api/quality/:id` - Get QC record by ID
- `PUT /api/quality/:id` - Update QC record
- `DELETE /api/quality/:id` - Delete QC record
- `GET /api/quality/user/:userId` - Get QC records by user
- `GET /api/quality/stats/quality` - Get quality statistics
- `GET /api/quality/stats/recent-failures` - Get recent QC failures

### Delivery Management
- `POST /api/delivery` - Create delivery record
- `GET /api/delivery` - Get all delivery records (paginated)
- `GET /api/delivery/:id` - Get delivery record by ID
- `PUT /api/delivery/:id` - Update delivery record
- `DELETE /api/delivery/:id` - Delete delivery record
- `GET /api/delivery/user/:userId` - Get delivery records by user
- `GET /api/delivery/stats/delivery` - Get delivery statistics
- `GET /api/delivery/stats/upcoming` - Get upcoming deliveries

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard data
- `GET /api/dashboard/supervisor` - Supervisor dashboard data
- `GET /api/dashboard/user` - User dashboard data
- `GET /api/dashboard/reports/:type` - Generate reports (operations, quality, production, users)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## File Uploads

The API supports image uploads for:
- Inspection photos
- QC inspector signatures
- Delivery proof images

Files are stored in the `/uploads` directory and served as static files.

## Database Models

### User
- Authentication and role management
- Task assignment tracking
- Performance statistics

### Inspection
- Component inspection records
- Image attachments
- Timing and completion tracking

### Finishing
- Tool usage monitoring
- Process timing
- Operator information

### QualityControl
- Measurement data with tolerance validation
- Automatic pass/fail determination
- Inspector signatures

### Delivery
- Customer and delivery information
- Status tracking
- Proof of delivery

## Environment Variables

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trackpro
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## Security Features

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- Helmet security headers
- File upload restrictions

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and error messages.

## Development

For development, use:
```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.