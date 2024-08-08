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
    prompt = f"""Generate a detailed and creative material entry for {name} ({category}, {subcategory}). Include extensive information and be more expansive in your descriptions. Follow this format, but feel free to add more properties and usage examples as appropriate for the specific wood:

    {{
        "name": "{name}",
        "description": "A comprehensive description of the wood, including its key characteristics, origin, appearance, and notable features.",
        "properties": {{
            "Density": "Value in g/cm³",
            "Janka Hardness": "Value in lbf (pounds-force)",
            "Modulus of Rupture": "Value in MPa",
            "Elastic Modulus": "Value in GPa",
            "Crushing Strength": "Value in MPa",
            "Shrinkage": "Radial %, Tangential %, Volumetric %",
            "Workability": "Description",
            "Durability": "Description",
            "Texture": "Description",
            "Grain": "Description",
            "Color": "Description",
            "Odor": "Description (if notable)",
            "Rot Resistance": "Description",
            "Availability": "Description",
            "Price": "Relative cost description",
            "Sustainability": "Information on harvesting and conservation status"
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
            {{"name": "Related Wood 1", "description": "Detailed comparison or relation to the main wood."}},
            {{"name": "Related Wood 2", "description": "Detailed comparison or relation to the main wood."}},
            {{"name": "Related Wood 3", "description": "Detailed comparison or relation to the main wood."}}
        ]
    }}

    Ensure all information is accurate and relevant to {name}. Be creative and expansive in your descriptions while maintaining scientific accuracy.
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
        "category_id": {"Hardwoods": 1, "Softwoods": 2, "Exotic Woods": 3, "Engineered Woods": 4}[category]
    })
    return material

def main():
    with open('wood.json', 'r') as f:
        materials_data = json.load(f)
    
    for category, subcategories in materials_data.items():
        for subcategory, names in subcategories.items():
            for name in names:
                material = generate_material(name, category, subcategory)
                if material:
                    # Use upsert with on_conflict parameter to replace existing entries
                    result = supabase.table('materials').upsert(
                        material,
                        on_conflict='slug'  # Using 'slug' instead of 'name'
                    ).execute()
                    print(f"{'Updated' if result.data else 'Failed to update'} {name}")
                else:
                    print(f"Failed to generate material for: {name}")
                time.sleep(2)

if __name__ == "__main__":
    main()