"""
Database Migration Script
Adds middle_name and department columns to existing students table
"""

import sqlite3
import os

def migrate_database():
    db_name = "enrollment_system.db"
    
    if not os.path.exists(db_name):
        print(f"Database {db_name} does not exist. No migration needed.")
        return
    
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(students)")
        columns = [column[1] for column in cursor.fetchall()]
        
        migrations_applied = []
        
        # Add middle_name column if it doesn't exist
        if 'middle_name' not in columns:
            cursor.execute("ALTER TABLE students ADD COLUMN middle_name TEXT")
            migrations_applied.append("middle_name")
            print("✅ Added 'middle_name' column to students table")
        else:
            print("ℹ️  'middle_name' column already exists")
        
        # Add department column if it doesn't exist
        if 'department' not in columns:
            cursor.execute("ALTER TABLE students ADD COLUMN department TEXT")
            migrations_applied.append("department")
            print("✅ Added 'department' column to students table")
        else:
            print("ℹ️  'department' column already exists")
        
        if migrations_applied:
            conn.commit()
            print(f"\n✅ Migration completed successfully! Added {len(migrations_applied)} column(s).")
        else:
            print("\n✅ Database is already up to date. No migration needed.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    print("=" * 60)
    print("🔄 Database Migration Script")
    print("=" * 60)
    migrate_database()
    print("=" * 60)
