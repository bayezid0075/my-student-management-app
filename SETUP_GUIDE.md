# 🚀 Quick Setup Guide

Follow these steps to get the Student Management System up and running.

## Prerequisites Checklist

- [ ] Python 3.10 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] MySQL 8.0 or higher installed and running
- [ ] Git installed (optional, for version control)

## Step-by-Step Setup

### 1️⃣ Database Setup (5 minutes)

1. **Start MySQL server**
   - Windows: Start MySQL service from Services
   - Mac: `mysql.server start`
   - Linux: `sudo systemctl start mysql`

2. **Create database**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### 2️⃣ Backend Setup (10 minutes)

1. **Open terminal and navigate to backend**
   ```bash
   cd "C:\Users\mdbh0\Desktop\Student Management\backend"
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   - Windows CMD: `venv\Scripts\activate`
   - Windows PowerShell: `venv\Scripts\Activate.ps1`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   > **Note**: This project uses PyMySQL (pure Python) instead of mysqlclient for easier installation, especially on Windows. No additional setup needed!

5. **Create environment file**
   - Copy `.env.example` to `.env`
   - Or create new `.env` file with:
   ```env
   SECRET_KEY=django-secret-key-change-this-in-production
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   DB_NAME=student_management_db
   DB_USER=root
   DB_PASSWORD=
   DB_HOST=localhost
   DB_PORT=3306

   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create admin user**
   ```bash
   python manage.py createsuperuser
   ```
   - Enter email, username, and password
   - Remember these credentials!

8. **Start backend server**
   ```bash
   python manage.py runserver
   ```
   - Backend running at: `http://localhost:8000`
   - Keep this terminal open!

### 3️⃣ Frontend Setup (5 minutes)

1. **Open NEW terminal and navigate to frontend**
   ```bash
   cd "C:\Users\mdbh0\Desktop\Student Management\frontend"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   - Copy `.env.local.example` to `.env.local`
   - Or create new `.env.local` file with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Start frontend server**
   ```bash
   npm run dev
   ```
   - Frontend running at: `http://localhost:3000`
   - Keep this terminal open!

### 4️⃣ Initial Setup via Admin Panel (10 minutes)

1. **Access Django Admin Panel**
   - Go to: `http://localhost:8000/admin`
   - Login with superuser credentials

2. **Create Test Users**

   **Admin User:**
   - Click "Users" → "Add User"
   - Username: `admin`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Check "Staff status" ✓
   - Check "Superuser status" ✓
   - Role: Select "ADMIN"
   - Save

   **Student User:**
   - Click "Users" → "Add User"
   - Username: `john_student`
   - Email: `student@example.com`
   - Password: `student123`
   - Role: Select "STUDENT"
   - Save

3. **Create a Student Profile**
   - Click "Students" → "Add Student"
   - User: Select the student user you just created
   - Name: `John Doe`
   - Email: `student@example.com`
   - Phone: `(555) 123-4567`
   - Enrollment Date: Select today's date
   - Save

4. **Create Test Course**
   - Click "Courses" → "Add Course"
   - Name: `Web Development Bootcamp`
   - Description: `Learn full-stack web development`
   - Duration: `6` (months)
   - Fee: `2999.00`
   - Status: `Active`
   - Save

5. **Create Test Batch**
   - Click "Batches" → "Add Batch"
   - Name: `Batch 2024-A`
   - Course: Select the course you created
   - Start Date: Today
   - End Date: 6 months from now
   - Instructor Name: `Dr. Jane Smith`
   - Save

### 5️⃣ Test the Application (5 minutes)

1. **Open browser and go to `http://localhost:3000`**

2. **Test Admin Login**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Should redirect to Admin Dashboard
   - Explore:
     - View dashboard statistics
     - Manage courses
     - Create batches
     - Enroll students
     - Generate invoices
     - Issue certificates

3. **Logout and Test Student Login**
   - Logout from admin
   - Email: `student@example.com`
   - Password: `student123`
   - Should redirect to Student Dashboard
   - Explore:
     - View enrolled courses
     - Check invoices
     - Download certificates

## 🎉 Success!

You now have a fully functional Student Management System!

## Common Issues & Solutions

### Issue: "Module not found" error in backend
**Solution:** Make sure you activated the virtual environment and installed requirements.txt

### Issue: "Database connection failed"
**Solution:**
- Check if MySQL is running
- Verify database credentials in `.env`
- Ensure database `student_management_db` exists

### Issue: "CORS error" in browser
**Solution:**
- Check that backend is running on port 8000
- Verify `CORS_ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:3000`

### Issue: Frontend won't start
**Solution:**
- Delete `node_modules` folder and `.next` folder
- Run `npm install` again
- Run `npm run dev`

### Issue: "Port already in use"
**Solution:**
- Backend: Use `python manage.py runserver 8001` (different port)
- Update frontend `.env.local` to match new port
- Frontend: Use `npm run dev -- -p 3001` (different port)

## Next Steps

1. **Create More Test Data**
   - Add more courses and batches
   - Create additional students
   - Practice enrolling students
   - Generate sample invoices and certificates

2. **Customize the System**
   - Modify color scheme in `frontend/tailwind.config.ts`
   - Update branding in PDF generators
   - Add new fields to models

3. **Deploy to Production**
   - Use PostgreSQL instead of MySQL
   - Set `DEBUG=False` in production
   - Use environment variables for all secrets
   - Set up proper domain and SSL

## Need Help?

Check the README.md files in:
- Main README: Project overview
- `backend/README.md`: Backend API documentation
- `frontend/README.md`: Frontend documentation

Happy coding! 🚀
