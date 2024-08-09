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

def clean_json_string(json_string):
    cleaned = ''.join(char for char in json_string if ord(char) >= 32 or char in '\n\t')
    cleaned = re.sub(r'\\\n', '', cleaned)
    cleaned = cleaned.replace('\r\n', '\\n').replace('\n', '\\n')
    cleaned = re.sub(r'(?<!\\)"(?=((?<!\\)"))', r'\\"', cleaned)
    return cleaned

def generate_material(name, category, subcategory):
    prompt = f"""Generate a detailed and creative material entry for {name} ({category}, {subcategory}). Include extensive information and be more expansive in your descriptions. Follow this format, but feel free to add more properties and usage examples as appropriate for the specific material:

    {{
        "name": "{name}",
        "description": "Provide a comprehensive and detailed description of {name}, including its classification, key characteristics, composition, microstructure, and notable features. Explain its unique properties, how it's engineered, and what sets it apart from other materials in its category. Include information about its typical applications, how it performs under various conditions, and any special manufacturing or processing techniques associated with it. Discuss its historical development, current importance in industry, and potential future applications. The description should be thorough, technical, and informative, similar in style and depth to this example: 'Tool steels are a class of high-performance ferrous alloys specifically engineered for exceptional hardness, wear resistance, and toughness. These specialized steels are designed to withstand the extreme conditions encountered in cutting, forming, and shaping other materials. Characterized by their high carbon content (typically 0.5-1.5%) and the presence of various alloying elements such as tungsten, molybdenum, vanadium, and chromium, tool steels exhibit superior strength and hardness retention at elevated temperatures. Their microstructure, often consisting of complex carbides dispersed in a martensitic matrix, contributes to their remarkable wear resistance and edge-holding ability. Tool steels can be further categorized into several subgroups, including water-hardening, oil-hardening, air-hardening, high-speed, hot-work, and shock-resistant varieties, each tailored for specific applications and performance requirements.'",
        "properties": {{
            "Density": "Value in g/cm³",
            "Strength": "Relevant strength values and units",
            "Elastic Modulus": "Value in GPa",
            "Thermal Conductivity": "Value in W/(m·K)",
            "Electrical Conductivity": "Value in S/m",
            "Melting Point": "Value in °C",
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
                    cleaned_json = clean_json_string(json_text)
                    material = json.loads(cleaned_json)
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON for material: {name}")
                    print(f"Error details: {str(e)}")
                    print("Problematic JSON:")
                    print(json_text)
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
        "category_id": get_category_id(category)
    })
    return material

def get_category_id(category):
    category_ids = {
        "Metals": 1,
        "Polymers": 2,
        "Ceramics": 3,
        "Composites": 4,
        "Advanced Materials": 5,
        "Natural Materials": 6,
        "Elastomers": 7,
        "Foams": 8,
        "Coatings": 9
    }
    return category_ids.get(category, 0)

def main():
    with open('categories.json', 'r') as f:
        materials_data = json.load(f)
    
    for category, subcategories in materials_data["Materials"].items():
        for subcategory, names in subcategories.items():
            if isinstance(names, list):
                for name in names:
                    material = generate_material(name, category, subcategory)
                    if material:
                        result = supabase.table('materials').upsert(
                            material,
                            on_conflict='slug'
                        ).execute()
                        print(f"{'Updated' if result.data else 'Failed to update'} {name}")
                    else:
                        print(f"Failed to generate material for: {name}")
                    time.sleep(2)
            else:
                for sub_subcategory, sub_names in names.items():
                    for name in sub_names:
                        material = generate_material(name, category, f"{subcategory} - {sub_subcategory}")
                        if material:
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