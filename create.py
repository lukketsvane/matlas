import os
import json
import time
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

with open("new_materials.json", "r") as f:
    materials = json.load(f)

with open("system_message.txt", "r") as f:
    system_message = f.read()

def generate_material_entry(material_name):
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Create a complete material entry for {material_name}, including all required fields as shown in the example. Ensure to generate realistic and accurate information for all fields."}
            ],
            max_tokens=2500,
            n=1,
            temperature=0.7,
            frequency_penalty=0.2,
            presence_penalty=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating entry for {material_name}: {str(e)}")
        return None

def parse_entry(entry_text):
    try:
        # Remove any leading/trailing whitespace and normalize line breaks
        entry_text = entry_text.strip().replace('\n', ' ').replace('\r', '')
        
        # Attempt to parse the JSON
        entry = json.loads(entry_text)
        
        # Add or modify fields as needed
        entry["header_image"] = ""  # Ensure header_image is empty
        entry["slug"] = entry["name"].lower().replace(" ", "-").replace("(", "").replace(")", "")
        entry["category_id"] = 1  # Assuming all new materials are in the "Metal" category
        entry["category"] = "Metal"
        entry["subcategory"] = "Advanced Materials"
        
        return entry
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {str(e)}")
        print("Problematic JSON:")
        print(entry_text[:500] + "..." if len(entry_text) > 500 else entry_text)
        return None

def update_supabase(entry):
    try:
        result = supabase.table("materials").insert(entry).execute()
        print(f"Successfully added {entry['name']}" if result.data else f"Failed to add {entry['name']}")
    except Exception as e:
        print(f"Error updating Supabase for {entry['name']}: {str(e)}")

def main():
    auto_mode = False
    for material in materials:
        material_name = material["name"]
        print(f"\nProcessing: {material_name}")

        entry_text = generate_material_entry(material_name)
        if entry_text:
            print("\nGenerated Entry:")
            print(entry_text)
            
            entry = parse_entry(entry_text)
            if entry:
                print("\nParsed Entry:")
                print(json.dumps(entry, indent=2))
                
                if not auto_mode:
                    user_input = input("\nDo you want to add this entry to the database? (y/n/a): ").strip().lower()
                    if user_input == 'a':
                        auto_mode = True
                
                if auto_mode or user_input == 'y':
                    update_supabase(entry)
                else:
                    print("Skipping database update for this entry.")
            else:
                print("Failed to parse the entry. Skipping database update.")
        else:
            print("Failed to generate entry. Skipping.")
        
        time.sleep(2)  # To avoid rate limiting

if __name__ == "__main__":
    main()