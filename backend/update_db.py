import pymysql

# Dodavanje material_path kolone u courses tabelu
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='Password123',
    database='drs_platforma'
)

try:
    with connection.cursor() as cursor:
        # Dodaj material_path kolonu
        cursor.execute("ALTER TABLE courses ADD COLUMN material_path VARCHAR(500) NULL AFTER description")
        print("✅ Dodata material_path kolona u courses tabelu")
        connection.commit()
except pymysql.err.OperationalError as e:
    if e.args[0] == 1060:  # Duplicate column name
        print("⚠️ Kolona material_path već postoji")
    else:
        raise
finally:
    connection.close()
