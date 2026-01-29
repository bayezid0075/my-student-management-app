"""
Script to reset database and run migrations.
Run this from the project root directory.
"""
import pymysql
import subprocess
import os
from pathlib import Path

# Database configuration
DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = '2516'
DB_NAME = 'student_management_db'

print("=" * 60)
print("Student Management System - Database Reset")
print("=" * 60)
print()

try:
    # Connect to MySQL (without selecting database)
    print("1. Connecting to MySQL...")
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD
    )
    cursor = connection.cursor()
    print("   [OK] Connected to MySQL")

    # Drop existing database
    print(f"\n2. Dropping database '{DB_NAME}' if it exists...")
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
    print(f"   [OK] Database '{DB_NAME}' dropped")

    # Create fresh database
    print(f"\n3. Creating fresh database '{DB_NAME}'...")
    cursor.execute(
        f"CREATE DATABASE {DB_NAME} "
        f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    )
    print(f"   [OK] Database '{DB_NAME}' created")

    # Close connection
    cursor.close()
    connection.close()
    print("\n4. Closed MySQL connection")

    # Run Django migrations
    print("\n5. Running Django migrations...")
    backend_dir = Path(__file__).parent / 'backend'
    os.chdir(backend_dir)

    result = subprocess.run(
        ['python', 'manage.py', 'migrate'],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("   [OK] Migrations completed successfully!")
        print("\n" + "=" * 60)
        print("SUCCESS! Database has been reset and migrations applied.")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Create a superuser:")
        print("   python manage.py createsuperuser")
        print("\n2. Run the development server:")
        print("   python manage.py runserver")
    else:
        print("   [FAIL] Migration failed!")
        print("\nError output:")
        print(result.stderr)

except pymysql.Error as e:
    print(f"\n[FAIL] MySQL Error: {e}")
    print("\nPlease check:")
    print("1. MySQL is running")
    print(f"2. User '{DB_USER}' has correct password")
    print("3. User has permission to create/drop databases")

except Exception as e:
    print(f"\n[FAIL] Error: {e}")
