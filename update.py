import os
import json
import time
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
supabase: Client = create_client(os.getenv("NEXT_PUBLIC_SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

with open("current.json", "r") as f:
    materials = json.load(f)

system_message = """You are a materials science expert contributing to Matlas, an advanced online encyclopedia for materials science and engineering. Matlas provides comprehensive, yet accessible, information to a broad audience, including students, hobbyists, engineers, and researchers. Be informative, detailed, and concise, avoiding verbose language and typical phrases of OpenAI models.

### Guidelines for Crafting Material Descriptions:
- **Engaging Introduction**: Start with a captivating intro that conveys the material's core attributes, such as historical significance, key features, or unique applications. Example: **[Duplex 2205 Stainless Steel](https://matlas.vercel.app/materials/duplex-2205-stainless-steel)**, known for its dual-phase structure, offers strength and corrosion resistance, crucial in marine and chemical industries.
- **Bold and Link Key Terms**: Bold important terms and the material name. Hyperlink the first mention using the format **[Material Name](https://matlas.vercel.app/materials/material-slug)**. Integrate relevant internal links using the appropriate URL format.
- **Structure**: Use sections like composition, properties, applications, and workability. Adapt these categories to emphasize the most critical aspects.
- **Composition Details**: Specify key elements and their percentages. Example: **[Chromium (22%)](https://matlas.vercel.app/materials/chromium)** in Duplex 2205 enhances corrosion resistance.
- **Properties**: Balance technical precision with accessibility. Example: Duplex 2205's microstructure provides resistance to stress corrosion cracking, ideal for harsh environments.
- **Applications**: Highlight notable uses across industries. Example: Duplex 2205 is used in offshore platforms due to its marine durability.
- **Workability**: Discuss how the material is worked with, including challenges. Example: Duplex 2205 offers good formability, but specific welding procedures are required to maintain its microstructure.
- **Content Length**: Aim for 300-400 words, focusing on essential information over strict word count.
- **Style**: Write in a varied, professional wiki style with non-formulaic language. Inform while maintaining clarity and excitement about the subject.

### Restrictions:
- No more than 1000 tokens. for description, 2000 in total 
- Be concise yet highly informative.
- Avoid typical OpenAI phrasing (e.g., "however," "in conclusion"). Do NOT include a summary at the end.

For each material, provide the following information in JSON format:
1. description: A comprehensive description of the material (300-400 words).
2. properties: A JSON object containing key physical and mechanical properties.
3. usage_examples: An array of 4 objects, each with a "title" and "description" of a specific application.
4. related_materials: An array of 3 objects, each describing a related material with its name and a brief comparison.
5. category: The primary category of the material (e.g., "Metal", "Polymer", "Ceramic").
6. subcategory: A more specific classification within the category.
7. key_words: An array of 10 relevant keywords or phrases.
8. category_path: An array representing the full path of the category (e.g., ["Metal", "Ferrous Metal"]).
9. future_prospects: A brief text discussing potential advancements or emerging applications."""

def generate_material_entry(material_name):
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Generate a comprehensive entry for {material_name} in JSON format."}
            ],
            max_tokens=3000,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        entry = json.loads(response.choices[0].message.content)
        entry["name"] = material_name
        entry["slug"] = material_name.lower().replace(" ", "-")
        entry["edit_history"] = [{"date": datetime.now().isoformat(), "editor": "AI Assistant", "changes": "Entry update"}]
        entry["category_id"] = 1
        return entry
    except Exception as e:
        print(f"Error generating entry for {material_name}: {str(e)}")
        return None

def update_supabase(entry):
    try:
        json_fields = ["properties", "usage_examples", "edit_history", "related_materials"]
        for field in json_fields:
            if isinstance(entry.get(field), str):
                entry[field] = json.loads(entry[field])
        entry["key_words"] = entry.get("key_words", [])
        entry["category_path"] = entry.get("category_path", [])
        existing_entry = supabase.table("materials").select("id").eq("slug", entry["slug"]).execute()
        if existing_entry.data:
            result = supabase.table("materials").update(entry).eq("slug", entry["slug"]).execute()
            print(f"Updated existing entry for {entry['name']}")
        else:
            result = supabase.table("materials").insert(entry).execute()
            print(f"Inserted new entry for {entry['name']}")
        if not result.data:
            print(f"No changes made for {entry['name']}")
    except Exception as e:
        print(f"Error updating Supabase for {entry['name']}: {str(e)}")

def main():
    i = 0
    try:
        while i < len(materials):
            print(f"\nProcessing: {materials[i]['name']}")
            user_input = input("Enter number of materials to process (or 'S' to skip): ").strip().lower()
            if user_input == 's':
                print(f"Skipping {materials[i]['name']}")
                i += 1
                continue
            try:
                num_to_process = int(user_input)
            except ValueError:
                print("Invalid input. Please enter a number or 'S'.")
                continue
            for j in range(i, min(i + num_to_process, len(materials))):
                entry = generate_material_entry(materials[j]['name'])
                if entry:
                    update_supabase(entry)
                time.sleep(2)
            i += num_to_process
    except KeyboardInterrupt:
        print("\nScript interrupted by user. Exiting gracefully...")
    finally:
        print("Script execution completed.")

if __name__ == "__main__":
    main()