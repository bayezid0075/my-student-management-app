# 🎓 Student Management System

A full-stack, production-ready Student Management System built with Django, MySQL, and Next.js, featuring a retro-styled UI with pastel rainbow colors.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin & Student)
- Secure password hashing
- Token refresh mechanism

### 📚 Course Management
- Create, Read, Update, Delete courses
- Track course duration, fees, and status
- Search and filter capabilities

### 👥 Batch Management
- Organize courses into batches
- Assign instructors
- Set start and end dates

### 🎓 Student Management
- Admin-only student creation
- Enrollment in courses and batches
- Track enrollment dates and history

### 🧾 Invoice Generation
- Auto-generated invoice numbers (INV-YYYY-XXXX)
- PDF generation with retro styling
- Student and admin access
- Download functionality

### 🏆 Certificate Generation
- Auto-generated certificate IDs (CERT-YYYY-XXXX)
- Professional PDF certificates
- Course completion tracking
- Download functionality

### 🎨 Retro UI Design
- Pastel rainbow color scheme
- Rounded cards and soft shadows
- Pixel-inspired font options
- Responsive design (mobile & desktop)
- Distinct admin and student dashboards

## 🛠 Tech Stack

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: MySQL 8.x
- **PDF Generation**: ReportLab
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Cookies**: js-cookie

## 📁 Project Structure

```
student-management/
├── backend/                    # Django backend
│   ├── config/                # Project settings
│   ├── apps/
│   │   ├── authentication/    # User & JWT auth
│   │   ├── courses/          # Course management
│   │   ├── batches/          # Batch management
│   │   ├── students/         # Student management
│   │   ├── invoices/         # Invoice & PDF generation
│   │   └── certificates/     # Certificate & PDF generation
│   ├── media/                # Generated PDFs
│   └── requirements.txt
│
└── frontend/                  # Next.js frontend
    ├── src/
    │   ├── app/              # App Router pages
    │   ├── components/       # Reusable components
    │   ├── lib/              # Utils & API client
    │   └── styles/           # Global styles
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create database:**
   ```sql
   CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials and other settings

6. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run development server:**
   ```bash
   python manage.py runserver
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.local.example` to `.env.local`
   - Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

4. **Run development server:**
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:3000`

## 🎯 Default Credentials

After creating a superuser, you can create additional users through the admin panel:

- **Admin Panel**: `http://localhost:8000/admin`
- **Login with your superuser credentials**

Create test accounts:
- Admin user with role = ADMIN
- Student user with role = STUDENT

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Refresh token
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/logout/` - Logout

### Courses
- `GET /api/courses/` - List courses
- `POST /api/courses/` - Create course (admin)
- `GET /api/courses/{id}/` - Get course
- `PUT /api/courses/{id}/` - Update course (admin)
- `DELETE /api/courses/{id}/` - Delete course (admin)

### Batches
- `GET /api/batches/` - List batches
- `POST /api/batches/` - Create batch (admin)
- `GET /api/batches/{id}/` - Get batch
- `PUT /api/batches/{id}/` - Update batch (admin)
- `DELETE /api/batches/{id}/` - Delete batch (admin)

### Students
- `GET /api/students/` - List students (admin)
- `POST /api/students/` - Create student (admin)
- `GET /api/students/{id}/` - Get student (admin)
- `PUT /api/students/{id}/` - Update student (admin)
- `POST /api/students/{id}/enroll/` - Enroll student (admin)

### Invoices
- `GET /api/invoices/` - List invoices
- `POST /api/invoices/` - Create invoice (admin)
- `GET /api/invoices/{id}/download/` - Download PDF

### Certificates
- `GET /api/certificates/` - List certificates
- `POST /api/certificates/` - Create certificate (admin)
- `GET /api/certificates/{id}/download/` - Download PDF

## 🎨 Color Scheme

- **Soft Pink**: `#FFB3D9`
- **Mint Green**: `#B4E7CE`
- **Lavender**: `#D4C5F9`
- **Peach**: `#FFDAB9`
- **Light Blue**: `#B3D9FF`
- **Cream Background**: `#FFF8E7`

## 🔒 Security Features

- Password hashing with PBKDF2
- JWT token-based authentication
- CORS configuration
- CSRF protection
- Role-based access control
- SQL injection prevention (Django ORM)
- XSS prevention (React escaping)

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Built with ❤️ using Django and Next.js

---

**Happy Learning! 🎓**
