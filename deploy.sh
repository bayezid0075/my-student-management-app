#!/bin/bash
set -euo pipefail

# ============================================================
# deploy.sh - Server-side deployment script
# Runs on VPS at /home/app/student-management/deploy.sh
# Triggered by GitHub Actions on every push to master
# ============================================================
#
# ==================== VPS INITIAL SETUP ====================
# Run these steps ONCE manually on your Ubuntu VPS before the first deployment.
#
# STEP 1: Update system & create app user
# -------------------------------------------------------
#   ssh root@YOUR_VPS_IP
#   apt update && apt upgrade -y
#   adduser --disabled-password --gecos "" app
#   usermod -aG sudo app
#
#   # Passwordless sudo for service management only
#   cat > /etc/sudoers.d/app << 'SUDOEOF'
#   app ALL=(ALL) NOPASSWD: /bin/systemctl restart studentmgmt-backend
#   app ALL=(ALL) NOPASSWD: /bin/systemctl restart studentmgmt-frontend
#   app ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
#   app ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
#   app ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload
#   SUDOEOF
#   chmod 0440 /etc/sudoers.d/app
#
# STEP 2: Install Python 3.13
# -------------------------------------------------------
#   apt install -y software-properties-common
#   add-apt-repository -y ppa:deadsnakes/ppa
#   apt update
#   apt install -y python3.13 python3.13-venv python3.13-dev
#   curl -sS https://bootstrap.pypa.io/get-pip.py | python3.13
#   python3.13 -m pip install pipenv
#   su - app -c "python3.13 -m pip install --user pipenv"
#
# STEP 3: Install Node.js 20 LTS
# -------------------------------------------------------
#   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
#   apt install -y nodejs
#
# STEP 4: Install MySQL 8
# -------------------------------------------------------
#   apt install -y mysql-server
#   systemctl enable mysql && systemctl start mysql
#   mysql_secure_installation
#
#   mysql -u root -p << 'SQLEOF'
#   CREATE DATABASE student_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#   CREATE USER 'smapp'@'localhost' IDENTIFIED BY 'YOUR_STRONG_DB_PASSWORD';
#   GRANT ALL PRIVILEGES ON student_management_db.* TO 'smapp'@'localhost';
#   FLUSH PRIVILEGES;
#   SQLEOF
#
# STEP 5: Install Nginx
# -------------------------------------------------------
#   apt install -y nginx
#   systemctl enable nginx
#
# STEP 6: Configure Firewall
# -------------------------------------------------------
#   ufw allow OpenSSH
#   ufw allow 'Nginx Full'
#   ufw --force enable
#
# STEP 7: SSH key for GitHub Actions
# -------------------------------------------------------
#   su - app
#   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions -N ""
#   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
#   chmod 600 ~/.ssh/authorized_keys
#   cat ~/.ssh/github_actions
#   # ^^^ Copy this private key into GitHub repo Settings > Secrets > VPS_SSH_KEY
#
# STEP 8: Clone repo & create directories
# -------------------------------------------------------
#   su - app
#   cd /home/app
#   git clone https://github.com/bayezid0075/my-student-management-app.git student-management
#   mkdir -p student-management/logs
#
# STEP 9: Create .env files (secrets live ONLY on the server)
# -------------------------------------------------------
#   # Generate a secret key:
#   python3.13 -c "import secrets; print(secrets.token_urlsafe(50))"
#
#   # Backend .env:
#   cat > /home/app/student-management/backend/.env << 'ENVEOF'
#   SECRET_KEY=paste-your-generated-secret-key-here
#   DEBUG=False
#   ALLOWED_HOSTS=YOUR_VPS_IP,localhost,127.0.0.1
#   DB_NAME=student_management_db
#   DB_USER=smapp
#   DB_PASSWORD=YOUR_STRONG_DB_PASSWORD
#   DB_HOST=localhost
#   DB_PORT=3306
#   CORS_ALLOWED_ORIGINS=http://YOUR_VPS_IP
#   HTTPS_ENABLED=False
#   ENVEOF
#
#   # Frontend .env.local:
#   cat > /home/app/student-management/frontend/.env.local << 'ENVEOF'
#   NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP/api
#   ENVEOF
#
# STEP 10: Install Nginx config & systemd services
# -------------------------------------------------------
#   # As root:
#   cp /home/app/student-management/nginx/studentmgmt.conf /etc/nginx/sites-available/studentmgmt
#   ln -sf /etc/nginx/sites-available/studentmgmt /etc/nginx/sites-enabled/
#   rm -f /etc/nginx/sites-enabled/default
#   nginx -t && systemctl reload nginx
#
#   cp /home/app/student-management/systemd/backend.service /etc/systemd/system/studentmgmt-backend.service
#   cp /home/app/student-management/systemd/frontend.service /etc/systemd/system/studentmgmt-frontend.service
#   systemctl daemon-reload
#   systemctl enable studentmgmt-backend studentmgmt-frontend
#
# STEP 11: First deployment - run this script
# -------------------------------------------------------
#   su - app
#   cd /home/app/student-management
#   bash deploy.sh
#
# STEP 12: Create Django superuser
# -------------------------------------------------------
#   cd /home/app/student-management/backend
#   pipenv run python manage.py createsuperuser
#
# ==================== END OF SETUP ====================

PROJECT_DIR="/home/app/student-management"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
LOG_FILE="$PROJECT_DIR/logs/deploy.log"

# Ensure logs directory exists
mkdir -p "$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== DEPLOYMENT STARTED =========="

# 1. Pull latest code
log "Pulling latest code from master..."
cd "$PROJECT_DIR"
git fetch origin master
git reset --hard origin/master

# 2. Backend: Install Python dependencies
log "Installing backend dependencies..."
cd "$BACKEND_DIR"
export PATH="$HOME/.local/bin:$PATH"
pipenv install --deploy --ignore-pipfile

# 3. Backend: Run migrations
log "Running database migrations..."
pipenv run python manage.py migrate --noinput

# 4. Backend: Collect static files
log "Collecting static files..."
pipenv run python manage.py collectstatic --noinput

# 5. Frontend: Install Node dependencies and build
log "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm ci

log "Building frontend..."
npm run build

# 6. Restart services
log "Restarting backend service..."
sudo systemctl restart studentmgmt-backend

log "Restarting frontend service..."
sudo systemctl restart studentmgmt-frontend

# 7. Reload Nginx
log "Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

log "========== DEPLOYMENT COMPLETED =========="

# Show service status
if systemctl is-active --quiet studentmgmt-backend; then
    log "Backend: RUNNING"
else
    log "Backend: FAILED - check logs with: journalctl -u studentmgmt-backend -n 50"
fi

if systemctl is-active --quiet studentmgmt-frontend; then
    log "Frontend: RUNNING"
else
    log "Frontend: FAILED - check logs with: journalctl -u studentmgmt-frontend -n 50"
fi
