import anthropic
import json
import time
import os
import re
from dotenv import load_dotenv
from prompt_toolkit import prompt
from prompt_toolkit.shortcuts import checkboxlist_dialog

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def generate_material_names(category, subcategory, count, existing_materials):
    prompt = f"Generate a list of {count} real, specific material names for '{category} - {subcategory}' as a JSON array. Exclude these existing materials: {existing_materials}"
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

def select_files():
    files = [f for f in os.listdir('./collections') if f.endswith('.json')]
    if not files:
        print("No JSON files found in ./collections directory.")
        return []

    results = checkboxlist_dialog(
        title="Select JSON files to update",
        text="Use space to select, 'A' to select all, and Enter to confirm:",
        values=[(f, f) for f in files]
    ).run()

    return results or []

def update_json_file(file_path, new_materials):
    with open(file_path, 'r+') as f:
        data = json.load(f)
        subcategory = list(data.keys())[0]
        existing_materials = set(data[subcategory])
        unique_new_materials = [m for m in new_materials if m not in existing_materials]
        data[subcategory].extend(unique_new_materials)
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()
    return len(unique_new_materials)

def main():
    selected_files = select_files()
    if not selected_files:
        print("No files selected. Exiting.")
        return

    target_count = int(prompt("Enter the number of new materials to add to each file: "))

    for file in selected_files:
        file_path = os.path.join('./collections', file)
        total_added = 0

        while total_added < target_count:
            with open(file_path, 'r') as f:
                data = json.load(f)
                subcategory = list(data.keys())[0]
                category = file.split('_')[0].replace('_', ' ').title()

            remaining = target_count - total_added
            new_materials = generate_material_names(category, subcategory, remaining, data[subcategory])
            
            if new_materials:
                added = update_json_file(file_path, new_materials)
                total_added += added
                print(f"Added {added} new materials to {file}. Total added: {total_added}/{target_count}")
            else:
                print(f"Failed to generate new materials for {file}")

            if total_added < target_count:
                time.sleep(2)  # To avoid hitting rate limits

        print(f"Finished updating {file}. Total new materials added: {total_added}")

    print("All selected files have been updated.")

if __name__ == "__main__":
    main()