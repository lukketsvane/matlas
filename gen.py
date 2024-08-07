import anthropic
import json
import time
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Initialize Supabase client
supabase: Client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

def generate_content(prompt):
    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text

def generate_material(name, category, subcategory):
    prompt = f"""Generate a detailed material entry for {name} in the {category} category, {subcategory} subcategory. 
    Include the following:
    1. A brief description (2-3 sentences)
    2. Properties in JSON format (include at least Density, Hardness, Melting Point, Tensile Strength, Corrosion Resistance, and Thermal Conductivity)
    3. At least 3 usage examples, each with a title and description
    4. An edit history with 3 entries, each containing date, editor name, and changes made
    5. At least 3 related materials, each with a name and brief description

    Ensure the information is scientifically accurate and detailed. Format the output as a JSON object with keys: description, properties, usage_examples, edit_history, and related_materials."""

    content = generate_content(prompt)

    try:
        material_entry = json.loads(content)
        return {
            "name": name,
            "description": material_entry['description'],
            "properties": json.dumps(material_entry['properties']),
            "usage_examples": json.dumps(material_entry['usage_examples']),
            "edit_history": json.dumps(material_entry['edit_history']),
            "related_materials": json.dumps(material_entry['related_materials'])
        }
    except json.JSONDecodeError:
        logging.error(f"Error parsing JSON for {name}. Skipping.")
        return None

def insert_or_update_supabase(table, data):
    try:
        # Check if the material already exists
        existing = supabase.table(table).select("name").eq("name", data["name"]).execute()
        if existing.data:
            logging.info(f"Material {data['name']} already exists. Updating.")
            response = supabase.table(table).update(data).eq("name", data["name"]).execute()
        else:
            logging.info(f"Inserting new material: {data['name']}")
            response = supabase.table(table).insert(data).execute()
        
        if response.data:
            logging.info(f"Successfully inserted/updated {data['name']} in {table}")
            return True
        else:
            logging.warning(f"No data returned when inserting/updating {data['name']} in {table}")
            return False
    except Exception as e:
        logging.error(f"Error inserting/updating {data['name']} in {table}: {str(e)}")
        return False

def main():
    with open('materials_to_generate.txt', 'r') as f:
        categories = {}
        current_category = ""
        current_subcategory = ""
        for line in f:
            line = line.strip()
            if line.startswith("Category:"):
                current_category = line.split(":")[1].strip()
                categories[current_category] = {}
            elif line.startswith("Subcategory:"):
                current_subcategory = line.split(":")[1].strip()
                categories[current_category][current_subcategory] = []
            elif line:
                categories[current_category][current_subcategory].append(line)

    for category, subcategories in categories.items():
        for subcategory, materials in subcategories.items():
            for material_name in materials:
                logging.info(f"Generating material entry for: {material_name}")
                material = generate_material(material_name, category, subcategory)
                if material:
                    inserted = insert_or_update_supabase('materials', material)
                    if inserted:
                        logging.info(f"Material {material_name} generated and inserted/updated successfully.")
                    else:
                        logging.info(f"Failed to insert/update material {material_name}.")
                else:
                    logging.error(f"Failed to generate material entry for {material_name}.")
                
                # Add a delay to avoid rate limiting
                time.sleep(2)

    logging.info("Generation complete for all materials.")

if __name__ == "__main__":
    main()