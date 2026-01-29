# 🏗️ System Architecture Documentation

## Overview

The Student Management System is a full-stack web application built with a clear separation between backend API and frontend UI, following modern web development best practices.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Next.js 14 (App Router)                   │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  Pages: Login, Admin Dashboard, Student Portal │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  Auth Context (JWT Token Management)           │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  API Client (Axios + Interceptors)             │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↕                                 │
│                     HTTP/REST API                           │
│                           ↕                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Django REST Framework Backend              │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  Authentication (JWT)                           │  │ │
│  │  │  - Login/Logout                                 │  │ │
│  │  │  - Token Refresh                                │  │ │
│  │  │  - Role-Based Access Control                    │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  API Endpoints (ViewSets)                       │  │ │
│  │  │  - Courses, Batches, Students                   │  │ │
│  │  │  - Invoices, Certificates                       │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │  Business Logic                                 │  │ │
│  │  │  - Enrollment Management                        │  │ │
│  │  │  - PDF Generation (ReportLab)                   │  │ │
│  │  │  - Auto-numbering (Invoices/Certificates)       │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                           ↕                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    MySQL Database                     │ │
│  │  Tables: users, courses, batches, students,          │ │
│  │          student_courses, invoices, certificates     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming language |
| Django | 5.0.1 | Web framework |
| Django REST Framework | 3.14.0 | REST API framework |
| djangorestframework-simplejwt | 5.3.1 | JWT authentication |
| MySQL | 8.0+ | Relational database |
| PyMySQL | 1.1.0 | MySQL connector (pure Python) |
| ReportLab | 4.0.9 | PDF generation |
| django-cors-headers | 4.3.1 | CORS handling |
| python-decouple | 3.8 | Environment management |

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.1.0 | React framework |
| React | 18.2.0 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.1 | Styling |
| Axios | 1.6.5 | HTTP client |
| js-cookie | 3.0.5 | Cookie management |

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    Users     │
│──────────────│
│ id (PK)      │───────┐
│ email        │       │
│ password     │       │
│ role         │       │
│ is_active    │       │
└──────────────┘       │
                       │ OneToOne
┌──────────────┐       │
│   Students   │       │
│──────────────│       │
│ id (PK)      │───────┘
│ user_id (FK) │
│ name         │────────┐
│ email        │        │
│ phone        │        │
└──────────────┘        │
       │                │
       │ Many           │ Many
       ↓                ↓
┌──────────────────┐   ┌──────────────┐
│ StudentCourses   │   │   Invoices   │
│──────────────────│   │──────────────│
│ id (PK)          │   │ id (PK)      │
│ student_id (FK)  │   │ student (FK) │
│ course_id (FK)   │   │ course (FK)  │
│ batch_id (FK)    │   │ batch (FK)   │
│ enrolled_at      │   │ invoice_no   │
└──────────────────┘   │ amount       │
       ↑               └──────────────┘
       │ Many
       │
┌──────────────┐       ┌──────────────────┐
│   Courses    │       │   Certificates   │
│──────────────│       │──────────────────│
│ id (PK)      │────┐  │ id (PK)          │
│ name         │    │  │ student (FK)     │
│ description  │    │  │ course (FK)      │
│ duration     │    │  │ batch (FK)       │
│ fee          │    │  │ certificate_id   │
│ status       │    │  │ completion_date  │
└──────────────┘    │  └──────────────────┘
                    │
                    │ One to Many
                    ↓
              ┌──────────────┐
              │   Batches    │
              │──────────────│
              │ id (PK)      │
              │ course (FK)  │
              │ name         │
              │ start_date   │
              │ end_date     │
              │ instructor   │
              └──────────────┘
```

## Authentication Flow

```
1. User Login
   ↓
2. Frontend sends credentials to /api/auth/login/
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT tokens (access + refresh)
   ↓
5. Frontend stores tokens in cookies
   ↓
6. Frontend includes access token in Authorization header
   ↓
7. Backend validates token on each request
   ↓
8. If token expired:
   a. Frontend sends refresh token to /api/auth/token/refresh/
   b. Backend returns new access token
   c. Frontend retries original request
   ↓
9. On logout:
   a. Frontend sends request to /api/auth/logout/
   b. Backend blacklists refresh token
   c. Frontend clears all cookies
```

## Request/Response Flow

### Example: Creating a Course (Admin)

```
1. Admin clicks "Add Course" button
   ↓
2. Modal form opens
   ↓
3. Admin fills form and clicks "Create"
   ↓
4. Frontend validates form data
   ↓
5. Frontend sends POST request to /api/courses/
   Headers: { Authorization: "Bearer <access_token>" }
   Body: { name, description, duration, fee, status }
   ↓
6. Backend receives request
   ↓
7. JWT middleware validates token
   ↓
8. IsAdminOrReadOnly permission checks user role
   ↓
9. CourseSerializer validates data
   ↓
10. Course model saves to database
   ↓
11. Backend returns 201 Created with course data
   ↓
12. Frontend shows success message
   ↓
13. Frontend refreshes course list
```

### Example: Downloading Invoice (Student)

```
1. Student clicks "Download" button on invoice
   ↓
2. Frontend sends GET to /api/invoices/{id}/download/
   Headers: { Authorization: "Bearer <access_token>" }
   ↓
3. Backend validates token and checks ownership
   ↓
4. If PDF doesn't exist:
   a. generate_invoice_pdf() creates PDF using ReportLab
   b. PDF saved to media/invoices/
   c. Path stored in invoice.pdf_path
   ↓
5. Backend returns PDF file
   ↓
6. Browser downloads PDF
```

## Security Architecture

### Security Layers

1. **Authentication Layer**
   - JWT tokens with short expiry (15 min access, 7 days refresh)
   - Secure password hashing (PBKDF2)
   - Token blacklisting on logout

2. **Authorization Layer**
   - Role-based permissions (Admin/Student)
   - Object-level permissions (students see only their data)
   - View-level permissions (CRUD restricted by role)

3. **Transport Layer**
   - CORS configuration (whitelist origins)
   - CSRF protection
   - HTTPS in production

4. **Data Layer**
   - SQL injection prevention (Django ORM)
   - XSS prevention (React escaping)
   - Input validation (serializers)

## File Storage

```
backend/media/
├── invoices/
│   ├── invoice_INV-2024-0001.pdf
│   ├── invoice_INV-2024-0002.pdf
│   └── ...
└── certificates/
    ├── certificate_CERT-2024-0001.pdf
    ├── certificate_CERT-2024-0002.pdf
    └── ...
```

## API Design Principles

1. **RESTful Design**
   - Resource-based URLs
   - HTTP methods (GET, POST, PUT, DELETE)
   - Status codes (200, 201, 400, 401, 404, 500)

2. **Pagination**
   - Default: 20 items per page
   - Response includes: count, next, previous, results

3. **Filtering & Search**
   - Search across multiple fields
   - Filter by related objects
   - Order by any field

4. **Response Format**
   ```json
   {
     "id": 1,
     "name": "Course Name",
     "related_object": 2,
     "related_object_details": { ... },
     "created_at": "2024-01-01T00:00:00Z"
   }
   ```

## Frontend Architecture

### Component Structure

```
App
├── Auth Provider (Context)
│   └── Middleware (Route Protection)
│       ├── Login Page
│       ├── Admin Layout
│       │   ├── Sidebar
│       │   ├── Header
│       │   └── Pages
│       │       ├── Dashboard
│       │       ├── Courses
│       │       ├── Batches
│       │       ├── Students
│       │       ├── Invoices
│       │       └── Certificates
│       └── Student Layout
│           ├── Header
│           ├── Navigation
│           └── Pages
│               ├── Dashboard
│               ├── Courses
│               ├── Invoices
│               └── Certificates
```

### State Management

- **Auth State**: React Context (global)
- **Form State**: Component state (local)
- **API Data**: Direct state with useEffect
- **Loading**: Boolean flags
- **Errors**: String messages

## Deployment Considerations

### Production Checklist

Backend:
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up media file storage (S3/CDN)
- [ ] Enable HTTPS
- [ ] Configure allowed hosts
- [ ] Set up logging
- [ ] Use Gunicorn/uWSGI
- [ ] Set up Nginx reverse proxy

Frontend:
- [ ] Build for production (`npm run build`)
- [ ] Set production API URL
- [ ] Enable analytics (optional)
- [ ] Configure CDN for static assets
- [ ] Set up monitoring

## Performance Optimizations

1. **Database**
   - Indexed foreign keys
   - select_related() for foreign keys
   - prefetch_related() for many-to-many

2. **API**
   - Pagination limits
   - Caching headers
   - Compression

3. **Frontend**
   - Code splitting (Next.js automatic)
   - Image optimization
   - Lazy loading

## Scalability

### Horizontal Scaling

- **Backend**: Multiple Django instances behind load balancer
- **Database**: Read replicas for heavy read operations
- **Media**: Object storage (S3) instead of local filesystem
- **Cache**: Redis for session/token management

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add database indexes
- Use connection pooling

## Monitoring & Logging

### Recommended Tools

- **Backend Monitoring**: Sentry, New Relic
- **Frontend Monitoring**: Vercel Analytics, Google Analytics
- **Logging**: ELK Stack, CloudWatch
- **Uptime**: Pingdom, UptimeRobot

## Future Enhancements

1. **Features**
   - Email notifications
   - Payment gateway integration
   - Attendance tracking
   - Grade management
   - Assignment submissions

2. **Technical**
   - WebSocket for real-time updates
   - Mobile app (React Native)
   - Progressive Web App
   - GraphQL API option

3. **UX**
   - Dark mode toggle
   - Multiple language support
   - Advanced reporting
   - Data export (CSV, Excel)

---

**Document Version**: 1.0
**Last Updated**: 2024-01-27
**Maintained By**: Development Team
