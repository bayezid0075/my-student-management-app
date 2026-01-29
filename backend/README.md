# Student Management System - Backend

Django REST API for the Student Management System.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=student_management_db
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Create MySQL Database

```sql
CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

## API Documentation

Base URL: `http://localhost:8000/api`

### Authentication Endpoints

- **POST** `/auth/login/` - Login and get JWT tokens
- **POST** `/auth/token/refresh/` - Refresh access token
- **GET** `/auth/me/` - Get current user info
- **POST** `/auth/logout/` - Logout and blacklist token

### Resource Endpoints

All resource endpoints support:
- Pagination
- Search
- Ordering
- Filtering

#### Courses
- **GET** `/courses/` - List all courses
- **POST** `/courses/` - Create course (Admin only)
- **GET** `/courses/{id}/` - Get course details
- **PUT** `/courses/{id}/` - Update course (Admin only)
- **DELETE** `/courses/{id}/` - Delete course (Admin only)

#### Batches
- **GET** `/batches/` - List all batches
- **GET** `/batches/?course={id}` - Filter by course
- **POST** `/batches/` - Create batch (Admin only)
- **GET** `/batches/{id}/` - Get batch details
- **PUT** `/batches/{id}/` - Update batch (Admin only)
- **DELETE** `/batches/{id}/` - Delete batch (Admin only)

#### Students
- **GET** `/students/` - List all students (Admin only)
- **POST** `/students/` - Create student (Admin only)
- **GET** `/students/{id}/` - Get student details (Admin only)
- **PUT** `/students/{id}/` - Update student (Admin only)
- **POST** `/students/{id}/enroll/` - Enroll in course (Admin only)

#### Invoices
- **GET** `/invoices/` - List invoices (filtered by role)
- **POST** `/invoices/` - Generate invoice (Admin only)
- **GET** `/invoices/{id}/` - Get invoice details
- **GET** `/invoices/{id}/download/` - Download PDF

#### Certificates
- **GET** `/certificates/` - List certificates (filtered by role)
- **POST** `/certificates/` - Issue certificate (Admin only)
- **GET** `/certificates/{id}/` - Get certificate details
- **GET** `/certificates/{id}/download/` - Download PDF

## Project Structure

```
backend/
├── config/                     # Project configuration
│   ├── settings.py            # Django settings
│   ├── urls.py                # Main URL config
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── authentication/        # User authentication
│   │   ├── models.py         # Custom User model
│   │   ├── serializers.py    # JWT serializers
│   │   ├── views.py          # Auth views
│   │   ├── permissions.py    # Custom permissions
│   │   └── urls.py
│   ├── courses/              # Course management
│   ├── batches/              # Batch management
│   ├── students/             # Student management
│   ├── invoices/             # Invoice generation
│   │   ├── pdf_generator.py # PDF creation logic
│   │   └── ...
│   └── certificates/         # Certificate generation
│       ├── pdf_generator.py # PDF creation logic
│       └── ...
├── media/                    # Generated PDFs
│   ├── invoices/
│   └── certificates/
└── manage.py
```

## Database Models

### User
- Custom user model extending AbstractUser
- Fields: email, role (ADMIN/STUDENT)

### Course
- Fields: name, description, duration, fee, status

### Batch
- Fields: name, course (FK), start_date, end_date, instructor_name

### Student
- Fields: user (OneToOne), name, email, phone, enrollment_date

### StudentCourse
- Many-to-many through table
- Fields: student (FK), course (FK), batch (FK), enrolled_at

### Invoice
- Fields: invoice_number, student (FK), course (FK), batch (FK), amount, payment_date, pdf_path

### Certificate
- Fields: certificate_id, student (FK), course (FK), batch (FK), completion_date, pdf_path

## Testing

Run tests with:

```bash
python manage.py test
```

## Admin Panel

Access the admin panel at `http://localhost:8000/admin` with your superuser credentials.

From there you can:
- Manage users
- View all data models
- Create test data
- Monitor system activity
