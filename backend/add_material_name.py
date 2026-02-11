"""
Skripta za dodavanje material_name kolone u courses tabelu
"""
from app import db, create_app
from sqlalchemy import text

app = create_app()

with app.app_context():
    # Dodaj kolonu material_name
    try:
        with db.engine.connect() as conn:
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN material_name VARCHAR(255) NULL
            """))
            conn.commit()
        print("✓ Kolona material_name uspešno dodata!")
    except Exception as e:
        if "Duplicate column name" in str(e) or "already exists" in str(e):
            print("✓ Kolona material_name već postoji")
        else:
            print(f"✗ Greška: {e}")
