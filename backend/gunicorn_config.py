"""
Gunicorn configuration for Student Management System.
Run with: pipenv run gunicorn config.wsgi:application -c gunicorn_config.py
"""
import multiprocessing
import os

# Bind to localhost only - Nginx will reverse proxy
bind = "127.0.0.1:8000"

# Workers: (2 x CPU cores) + 1
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "/home/app/student-management/logs/gunicorn-access.log"
errorlog = "/home/app/student-management/logs/gunicorn-error.log"
loglevel = "info"

# Process naming
proc_name = "studentmgmt-backend"

# Limit request sizes (16MB for file uploads)
limit_request_body = 16777216

# Graceful restart
graceful_timeout = 30
preload_app = True
