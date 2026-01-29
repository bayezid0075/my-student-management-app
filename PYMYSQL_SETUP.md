# PyMySQL Setup Notes

## Why PyMySQL?

This project uses **PyMySQL** instead of **mysqlclient** because:

1. **Pure Python**: No C compiler or MySQL development libraries required
2. **Easy Installation**: Works on Windows without additional setup
3. **Cross-Platform**: Consistent behavior across Windows, Mac, and Linux
4. **Drop-in Replacement**: Compatible with Django's MySQL backend

## What Was Changed

### 1. Requirements File
- **Before**: `mysqlclient==2.2.1`
- **After**: `PyMySQL==1.1.0`

### 2. Django Initialization
Added to `backend/config/__init__.py`:
```python
import pymysql
pymysql.install_as_MySQLdb()
```

This makes PyMySQL work as a drop-in replacement for MySQLdb.

### 3. Database Configuration
No changes needed! The Django settings remain the same:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'student_management_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

## Installation

Simply install from requirements.txt:
```bash
pip install -r requirements.txt
```

PyMySQL will be installed automatically.

## Compatibility

PyMySQL is fully compatible with:
- Django 3.2+
- Python 3.7+
- MySQL 5.7+
- MariaDB 10.2+

## Performance Notes

- **PyMySQL**: Pure Python, easier to install, slightly slower
- **mysqlclient**: C-based, faster, harder to install

For most applications, PyMySQL performance is more than sufficient. The ease of installation makes it a better choice for development and smaller production deployments.

## Troubleshooting

### Issue: "No module named 'MySQLdb'"

**Solution**: Make sure `pymysql.install_as_MySQLdb()` is called in `config/__init__.py`

### Issue: "Authentication plugin 'caching_sha2_password' not supported"

**Solution**: Use MySQL 8.0+ or change MySQL authentication:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Issue: Connection timeout

**Solution**: Check that MySQL server is running:
```bash
# Windows
net start MySQL80

# Mac
mysql.server start

# Linux
sudo systemctl start mysql
```

## Migration from mysqlclient

If you previously had mysqlclient installed:

1. Uninstall mysqlclient:
   ```bash
   pip uninstall mysqlclient
   ```

2. Install PyMySQL:
   ```bash
   pip install PyMySQL==1.1.0
   ```

3. Ensure `config/__init__.py` has the initialization code

4. Restart Django server

No database changes or migrations are needed!

## Production Use

PyMySQL is production-ready and used by many Django applications. However, for high-traffic applications where every millisecond counts, consider:

- Using connection pooling
- Optimizing queries
- Adding read replicas
- Or switching to mysqlclient for marginal performance gains

## Documentation

- [PyMySQL GitHub](https://github.com/PyMySQL/PyMySQL)
- [PyMySQL Documentation](https://pymysql.readthedocs.io/)
- [Django MySQL Notes](https://docs.djangoproject.com/en/5.0/ref/databases/#mysql-notes)
