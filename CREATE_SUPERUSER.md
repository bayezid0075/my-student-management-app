# Create Superuser

Run this command to create an admin user:

```bash
cd backend
python manage.py createsuperuser
```

## Recommended Credentials

**For Admin/Superuser:**
- Email: `admin@example.com`
- Username: `admin`
- Password: `admin123`

The script will prompt you for:
1. **Email address**: Enter your email
2. **Username**: Enter desired username
3. **Password**: Enter password (won't be visible)
4. **Password (again)**: Confirm password

## After Creating Superuser

### 1. Start Backend Server
```bash
python manage.py runserver
```
Backend will run at: `http://localhost:8000`

### 2. Test Django Admin
Visit: `http://localhost:8000/admin`
Login with your superuser credentials

### 3. Create Test Data via Django Admin

**Create a Student User:**
1. Go to "Users" → "Add User"
2. Email: `student@example.com`
3. Username: `student`
4. Password: `student123`
5. Role: Select "STUDENT"
6. Save

**Create a Student Profile:**
1. Go to "Students" → "Add Student"
2. User: Select the student user you created
3. Name: `John Doe`
4. Email: `student@example.com`
5. Phone: `(555) 123-4567`
6. Enrollment Date: Today's date
7. Save

**Create a Course:**
1. Go to "Courses" → "Add Course"
2. Name: `Web Development Bootcamp`
3. Description: `Learn full-stack web development`
4. Duration: `6` (months)
5. Fee: `2999.00`
6. Status: `Active`
7. Save

### 4. Setup Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 5. Test the Application

**Test Admin Login:**
- Go to `http://localhost:3000`
- Email: `admin@example.com`
- Password: `admin123`
- Should redirect to admin dashboard

**Test Student Login:**
- Logout
- Email: `student@example.com`
- Password: `student123`
- Should redirect to student dashboard

## You're All Set! 🚀

Your Student Management System is now fully operational!
