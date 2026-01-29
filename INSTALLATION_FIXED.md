# ✅ Installation Issues Fixed

## What Was Fixed

### 1. **Removed python-decouple dependency**
- **Issue**: ImportError with `python-decouple` package
- **Solution**: Replaced with Python's built-in `os` module
- **Changed**: [backend/config/settings.py](backend/config/settings.py) now uses `os.environ.get()` instead of `config()`

### 2. **Updated Pillow version**
- **Issue**: Build error with Pillow 10.2.0
- **Solution**: Changed to `Pillow>=10.0.0` for better compatibility
- **Result**: Successfully installs latest compatible version

### 3. **Installed all dependencies**
- ✅ Django 5.0.1
- ✅ Django REST Framework 3.14.0
- ✅ djangorestframework-simplejwt 5.3.1
- ✅ PyMySQL 1.1.0
- ✅ django-cors-headers 4.3.1
- ✅ ReportLab 4.0.9
- ✅ Pillow 11.3.0 (latest compatible)

## ✅ System Check Passed

```bash
System check identified no issues (0 silenced).
```

## 🚀 Next Steps

### 1. Create MySQL Database

```sql
CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run Migrations

```bash
cd backend
python manage.py migrate
```

### 3. Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Email: `admin@example.com`
- Username: `admin`
- Password: `admin123` (or your choice)

### 4. Start Backend Server

```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### 5. Setup Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 📁 Configuration

The app now uses **environment variables** with sensible defaults:

### Default Configuration (works out of the box):
- **Database Name**: `student_management_db`
- **Database User**: `root`
- **Database Password**: (empty)
- **Database Host**: `localhost`
- **Database Port**: `3306`
- **Secret Key**: Auto-generated for development
- **Debug Mode**: `True`
- **Allowed Hosts**: `localhost`, `127.0.0.1`
- **CORS Origins**: `http://localhost:3000`, `http://127.0.0.1:3000`

### To Override (Optional):

**Option A: Environment Variables**

Windows CMD:
```cmd
set DB_PASSWORD=mypassword
set SECRET_KEY=my-secret-key
python manage.py runserver
```

Windows PowerShell:
```powershell
$env:DB_PASSWORD="mypassword"
$env:SECRET_KEY="my-secret-key"
python manage.py runserver
```

**Option B: Using .env file**

1. Install python-dotenv:
   ```bash
   pip install python-dotenv
   ```

2. Add to top of `config/settings.py` (after imports):
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

3. Create `.env` file in backend folder:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=student_management_db
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=3306
   ```

## 🎯 Quick Test

After running migrations and creating superuser:

1. Visit: `http://localhost:8000/admin`
2. Login with superuser credentials
3. Create test data (courses, students, etc.)

Then test the frontend:
1. Visit: `http://localhost:3000`
2. Login with credentials
3. Explore admin/student dashboards

## 🔧 Troubleshooting

### "No module named 'rest_framework'"
**Fixed!** All packages are now installed.

### "Cannot import name 'config' from 'decouple'"
**Fixed!** Removed python-decouple, using os.environ now.

### "Can't connect to MySQL server"
Make sure MySQL is running:
```bash
net start MySQL80
```
Or check Services and start MySQL manually.

### "Access denied for user 'root'@'localhost'"
Set your MySQL password in environment variable:
```cmd
set DB_PASSWORD=yourpassword
```

## 📦 Installed Packages

```
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
PyMySQL==1.1.0
django-cors-headers==4.3.1
reportlab==4.0.9
Pillow>=10.0.0
```

## ✅ Success!

Your Django backend is now properly configured and ready to run! 🎉

All dependencies are installed and the system check passes with no issues.
