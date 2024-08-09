import anthropic, json, time, os, re
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def generate_material_names(category, subcategory, count):
    prompt = f"Generate a list of {count} real, specific material names for '{category} - {subcategory}' as a JSON array."
    response = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw_text = response.content[0].text if response.content else ""
    json_match = re.search(r'\[.*\]', raw_text, re.DOTALL)
    
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError as e:
            print(f"JSON decode error for {category} - {subcategory}: {e}")
    else:
        print(f"No JSON array found in the response for {category} - {subcategory}")
    return None

def main():
    with open('materials.json', 'r') as f:
        categories = json.load(f)
    
    count = int(input("Enter the number of materials to generate per subcategory (10-200): "))
    count = max(10, min(200, count))  # Ensure count is between 10 and 200
    
    os.makedirs('./collections', exist_ok=True)

    for category, subcategories in categories.items():
        for subcategory in subcategories:
            material_names = generate_material_names(category, subcategory, count)
            if material_names:
                filename = f"./collections/{category.lower().replace(' ', '_')}_{subcategory.lower().replace(' ', '_')}.json"
                with open(filename, 'w') as f:
                    json.dump({subcategory: material_names}, f, indent=2)
                print(f"Generated {len(material_names)} materials for {category} - {subcategory}")
            else:
                print(f"Failed to generate materials for {category} - {subcategory}")
            time.sleep(2)  # To avoid hitting rate limits

if __name__ == "__main__":
    main()