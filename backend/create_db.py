import pymysql

# Kreiranje baze podataka
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='Password123'
)

try:
    with connection.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS drs_platforma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("Baza podataka 'drs_platforma' je uspešno kreirana!")
finally:
    connection.close()
