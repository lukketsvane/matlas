import anthropic
import json
import time
import os
import re
from dotenv import load_dotenv
from supabase import create_client
from prompt_toolkit.shortcuts import checkboxlist_dialog, input_dialog
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import Progress, SpinnerColumn, TextColumn
import logging

# Load environment variables and set up clients
load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Set up rich console and logging
console = Console()
logging.basicConfig(level=logging.INFO, format="%(message)s", handlers=[RichHandler(console=console, rich_tracebacks=True)])
logger = logging.getLogger("rich")

# Define directories
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COLLECTIONS_DIR = os.path.join(SCRIPT_DIR, 'collections')

def load_categories():
    with open('categories.json', 'r') as f:
        return json.load(f)

CATEGORIES = load_categories()

def get_category_from_filename(filename):
    parts = filename.split('_')
    if parts[0] == 'materials':
        return parts[1].capitalize()
    elif len(parts) >= 2:
        return f"{parts[0].capitalize()} {parts[1].capitalize()}"
    else:
        return parts[0].capitalize()

def get_full_category_path(material_name, filename):
    category = get_category_from_filename(filename)
    
    def search_categories(data, path=[]):
        if isinstance(data, dict):
            for key, value in data.items():
                new_path = path + [key]
                if key == category:
                    return new_path
                result = search_categories(value, new_path)
                if result:
                    return result
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, str) and item.lower() == material_name.lower():
                    return path
        return None

    return search_categories(CATEGORIES['Materials'])

def generate_material(name, category_path):
    category = category_path[-2] if len(category_path) >= 2 else category_path[-1]
    subcategory = category_path[-1]
    prompt = f"""Generate a detailed and creative material entry for {name} (Category: {category}, Subcategory: {subcategory}). Include extensive information and be more expansive in your descriptions. Follow this format:

    {{
        "name": "{name}",
        "description": "A comprehensive description of the material, including its key characteristics, origin, appearance, and notable features.",
        "properties": {{
            "Density": "Value in g/cm³",
            "Hardness": "Appropriate hardness scale and value",
            "Tensile Strength": "Value in MPa",
            "Yield Strength": "Value in MPa",
            "Elastic Modulus": "Value in GPa",
            "Thermal Conductivity": "Value in W/(m·K)",
            "Electrical Resistivity": "Value in Ω·m",
            "Melting Point": "Value in °C",
            "Specific Heat Capacity": "Value in J/(g·K)",
            "Coefficient of Thermal Expansion": "Value in 10^-6/K",
            "Corrosion Resistance": "Description",
            "Machinability": "Description",
            "Weldability": "Description",
            "Formability": "Description",
            "Chemical Composition": "Percentage breakdown of main elements",
            "Crystal Structure": "Description",
            "Magnetic Properties": "Description",
            "Optical Properties": "Description",
            "Environmental Impact": "Description of production and recycling implications",
            "Cost": "Relative cost description"
        }},
        "usage_examples": [
            {{"title": "Example 1", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 2", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 3", "description": "Detailed description of usage in this field."}},
            {{"title": "Example 4", "description": "Detailed description of usage in this field."}}
        ],
        "processing_methods": [
            {{"method": "Method 1", "description": "Detailed description of this processing method."}},
            {{"method": "Method 2", "description": "Detailed description of this processing method."}},
            {{"method": "Method 3", "description": "Detailed description of this processing method."}}
        ],
        "historical_significance": "Description of the material's historical importance and development.",
        "future_prospects": "Insights into potential future applications or developments.",
        "sustainability": "Information on the material's environmental impact and sustainability.",
        "related_materials": [
            {{"name": "Related Material 1", "description": "Detailed comparison or relation to the main material."}},
            {{"name": "Related Material 2", "description": "Detailed comparison or relation to the main material."}},
            {{"name": "Related Material 3", "description": "Detailed comparison or relation to the main material."}}
        ]
    }}

    Ensure all information is accurate and relevant to {name}. Be creative and expansive in your descriptions while maintaining scientific accuracy.
    """
    
    response = client.messages.create(model="claude-3-5-sonnet-20240620", max_tokens=4000, messages=[{"role": "user", "content": prompt}])
    
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
                    logger.error(f"Failed to decode JSON for material: {name} with error: {e}")
                    return None
            else:
                logger.error(f"No JSON content found in response for material: {name}")
                return None
        else:
            logger.error(f"No text field in response content for material: {name}")
            return None
    else:
        logger.error(f"Empty or invalid response for material: {name}")
        return None
    
    material.update({
        "category": category,
        "subcategory": subcategory,
        "slug": name.lower().replace(' ', '-').replace('(', '').replace(')', ''),
        "header_image": "",
        "category_path": category_path
    })
    return material

def material_exists(name):
    result = supabase.table('materials').select('name').eq('name', name).execute()
    return len(result.data) > 0

def select_files():
    files = [f for f in os.listdir(COLLECTIONS_DIR) if f.endswith('.json')]
    return checkboxlist_dialog(
        title="Select JSON files to process",
        text="Use space to select, 'A' to select all, and Enter to confirm:",
        values=[(f, f) for f in files]
    ).run() if files else []

def main():
    selected_files = select_files()
    if not selected_files:
        logger.info("No files selected. Exiting.")
        return

    num_materials = int(input_dialog(
        title="Number of Materials",
        text="Enter the number of materials to generate per file (or 0 for all):"
    ).run())

    total_processed = total_skipped = total_failed = 0

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        console=console
    ) as progress:
        overall_task = progress.add_task("[cyan]Overall progress...", total=len(selected_files))
        
        for file in selected_files:
            file_path = os.path.join(COLLECTIONS_DIR, file)
            logger.info(f"Processing file: [bold blue]{file}[/bold blue]")
            
            with open(file_path, 'r') as f:
                materials_data = json.load(f)
            
            file_task = progress.add_task(f"[green]Processing {file}...", total=len(materials_data))

            for subcategory, materials in materials_data.items():
                materials_to_process = materials[:num_materials] if num_materials > 0 else materials
                
                for name in materials_to_process:
                    if material_exists(name):
                        logger.info(f"Skipping existing material: [bold yellow]{name}[/bold yellow]")
                        total_skipped += 1
                    else:
                        category_path = get_full_category_path(name, file)
                        if not category_path:
                            logger.warning(f"Could not find category path for material: [bold yellow]{name}[/bold yellow]. Using default category.")
                            category_path = ["Materials", get_category_from_filename(file), "Miscellaneous"]

                        material = generate_material(name, category_path)
                        if material:
                            try:
                                result = supabase.table('materials').insert(material).execute()
                                if result.data:
                                    total_processed += 1
                                    logger.info(f"Added new material: [bold green]{name}[/bold green]")
                                else:
                                    total_failed += 1
                                    logger.error(f"Failed to add material: [bold red]{name}[/bold red]")
                            except Exception as e:
                                total_failed += 1
                                logger.error(f"Error adding material {name}: {str(e)}")
                        else:
                            total_failed += 1
                            logger.error(f"Failed to generate data for material: [bold red]{name}[/bold red]")

                    progress.update(file_task, advance=1)
                    time.sleep(2)  # To avoid hitting rate limits

            progress.update(overall_task, advance=1)

    logger.info(f"Task completed. Total materials processed: [bold green]{total_processed}[/bold green]")
    logger.info(f"Total materials skipped (already in database): [bold yellow]{total_skipped}[/bold yellow]")
    logger.info(f"Total materials failed: [bold red]{total_failed}[/bold red]")

if __name__ == "__main__":
    main()