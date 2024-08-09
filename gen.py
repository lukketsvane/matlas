import anthropic
import json
import time
import os
import re
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

def generate_material(name, category, subcategory):
    prompt = f"""Generate a detailed and creative material entry for {name} ({category}, {subcategory}). Include extensive information and be more expansive in your descriptions. Follow this format, but feel free to add more properties and usage examples as appropriate for the specific material:

    {{
        "name": "{name}",
        "description": "A comprehensive description of the material, including its key characteristics, origin, appearance, and notable features.",
        "properties": {{
            "Density": "Value in g/cm³",
            "Specific Strength": "Value in kN·m/kg",
            "Elastic Modulus": "Value in GPa",
            "Tensile Strength": "Value in MPa",
            "Yield Strength": "Value in MPa",
            "Thermal Conductivity": "Value in W/(m·K)",
            "Electrical Resistivity": "Value in Ω·m",
            "Corrosion Resistance": "Description",
            "Workability": "Description",
            "Durability": "Description",
            "Texture": "Description",
            "Color": "Description",
            "Availability": "Description",
            "Price": "Relative cost description",
            "Sustainability": "Information on production and environmental impact"
        }},
        "usage_examples": [
            {{"title": "Example 1", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 2", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 3", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 4", "description": "Detailed description of usage in this field."}}
        ],
        "edit_history": [
            {{"date": "2024-06-15", "editor": "AI Assistant", "changes": "Comprehensive update with expanded information."}}
        ],
        "related_materials": [
            {{"name": "Related Material 1", "description": "Detailed comparison or relation to the main material."}},
            {{"name": "Related Material 2", "description": "Detailed comparison or relation to the main material."}},
            {{"name": "Related Material 3", "description": "Detailed comparison or relation to the main material."}}
        ],
        "key_words": ["List", "of", "relevant", "keywords", "for", "this", "material"]
    }}

    Ensure all information is accurate and relevant to {name}. Be creative and expansive in your descriptions while maintaining scientific accuracy. For the key_words field, include 5-10 relevant keywords or short phrases that best describe or categorize this material.
    """
    
    response = client.messages.create(model="claude-3-5-sonnet-20240620", max_tokens=3000, messages=[{"role": "user", "content": prompt}])
    
    if response and response.content and len(response.content) > 0:
        text_block = response.content[0]
        if hasattr(text_block, 'text'):
            raw_text = text_block.text
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
                try:
                    material = json.loads(json_text)
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON for material: {name} with error: {e}")
                    return None
            else:
                print(f"No JSON content found in response for material: {name}")
                return None
        else:
            print(f"No text field in response content for material: {name}")
            return None
    else:
        print(f"Empty or invalid response for material: {name}")
        return None
    
    material.update({
        "category": category,
        "subcategory": subcategory,
        "slug": name.lower().replace(' ', '-'),
        "header_image": "",
        "category_id": {"Metal": 1, "Polymer": 2, "Ceramic": 3, "Composite": 4, "Other Engineering Material": 5}[category]
    })
    return material

def main():
    with open('materials.json', 'r') as f:
        materials_data = json.load(f)
    
    for category, subcategories in materials_data.items():
        for subcategory, names in subcategories.items():
            for name in names:
                material = generate_material(name, category, subcategory)
                if material:
                    # Use upsert with on_conflict parameter to replace existing entries
                    result = supabase.table('materials').upsert(
                        material,
                        on_conflict='slug'
                    ).execute()
                    print(f"{'Updated' if result.data else 'Failed to update'} {name}")
                else:
                    print(f"Failed to generate material for: {name}")
                time.sleep(2)

if __name__ == "__main__":
    main()