import pandas as pd
from supabase import create_client, Client

# Initialize Supabase Client
SUPABASE_URL = "https://qfkyngbkkivebrkooeva.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFma3luZ2Jra2l2ZWJya29vZXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4NTYzMzQsImV4cCI6MjAzODQzMjMzNH0.NKKhrnKhnX-hS8Jd2apIzfgw0Aild2V1CSmH66K-RQg"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Define the path to the log file
log_file_path = 'upload_log.txt'

def log_status(message):
    """Append a log message to the log file."""
    with open(log_file_path, 'a') as log_file:
        log_file.write(message + '\n')

def insert_material_to_supabase(material_data):
    """
    Insert a single material row into the Supabase materials table.
    """
    try:
        # Insert the material into the materials table
        response = supabase.table('materials').insert(material_data).execute()
        if response.status_code == 201:
            log_status(f"SUCCESS: Inserted material: {material_data['name']}")
        else:
            log_status(f"ERROR: Failed to insert material: {material_data['name']}, Error: {response.text}")
    except Exception as e:
        log_status(f"EXCEPTION: An error occurred with material: {material_data['name']}, Error: {str(e)}")

# Example of how you might define a material to insert
material_example = {
    "name": "Example Material",
    "description": "A sample material used for demonstration.",
    "properties": {"density": "2.5 g/cm³", "melting_point": "1500°C"},
    "usage_examples": [{"title": "Construction", "description": "Used in building materials."}],
    "edit_history": [{"date": "2024-08-08", "editor": "John Doe", "changes": "Initial entry."}],
    "related_materials": [{"name": "Related Material", "description": "Similar use cases."}],
    "header_image": None,
    "slug": "example-material",
    "category_id": None,
    "category": "Example Category",
    "subcategory": "Example Subcategory"
}

# Insert the example material into the database
insert_material_to_supabase(material_example)
