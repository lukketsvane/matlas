import anthropic, json, time, os, csv
from dotenv import load_dotenv
from supabase import create_client
from prompt_toolkit.shortcuts import checkboxlist_dialog
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import Progress, SpinnerColumn, TextColumn
import logging

load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

console = Console()
logging.basicConfig(level=logging.INFO, format="%(message)s", handlers=[RichHandler(console=console, rich_tracebacks=True)])
logger = logging.getLogger("rich")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
COLLECTIONS_DIR = os.path.join(SCRIPT_DIR, 'collections')
PROMPT_FILE = os.path.join(SCRIPT_DIR, 'material_prompt.md')
LOG_FILE = os.path.join(SCRIPT_DIR, 'materials_log.csv')

def read_prompt_template():
    with open(PROMPT_FILE, 'r') as file:
        return file.read()

PROMPT_TEMPLATE = read_prompt_template()

def generate_material_entry(name, category, subcategory):
    prompt = PROMPT_TEMPLATE.format(name=name, category=category, subcategory=subcategory)
    response = client.messages.create(model="claude-3-5-sonnet-20240620", max_tokens=4086, messages=[{"role": "user", "content": prompt}])
    try:
        return {"description": response.content[0].text, "name": name, "category": category, "subcategory": subcategory, "slug": name.lower().replace(' ', '-')}
    except Exception as e:
        logger.error(f"Error generating entry for {name}: {e}")
        return None

def material_exists(name):
    result = supabase.table('materials').select('name').eq('name', name).execute()
    return len(result.data) > 0

def select_files():
    files = [f for f in os.listdir(COLLECTIONS_DIR) if f.endswith('.json')]
    return checkboxlist_dialog(title="Select JSON files to process", text="Use space to select, 'A' to select all, and Enter to confirm:", values=[(f, f) for f in files]).run() if files else []

def process_file(file_path, csv_writer, progress):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    category, subcategory = os.path.basename(file_path).split('_')
    category, subcategory = category.replace('_', ' ').title(), subcategory.split('.')[0].replace('_', ' ').title()
    
    materials = data[list(data.keys())[0]]
    new_materials = skipped_materials = 0

    task_id = progress.add_task(f"[cyan]Processing {os.path.basename(file_path)}...", total=len(materials))

    for material in materials:
        if material_exists(material):
            logger.info(f"Skipping existing material: [bold]{material}[/bold]")
            skipped_materials += 1
        else:
            material_data = generate_material_entry(material, category, subcategory)
            if material_data:
                result = supabase.table('materials').insert(material_data).execute()
                if result.data:
                    new_materials += 1
                    logger.info(f"Added new material: [bold green]{material}[/bold green]")
                    csv_writer.writerow([material_data['name'], material_data['category'], material_data['subcategory'], material_data['slug']])
                else:
                    logger.error(f"Failed to add material: [bold red]{material}[/bold red]")
            else:
                logger.error(f"Failed to generate data for material: [bold red]{material}[/bold red]")

        progress.update(task_id, advance=1)
        time.sleep(1)

    return new_materials, skipped_materials

def main():
    selected_files = select_files()
    if not selected_files:
        logger.info("No files selected. Exiting.")
        return

    total_new = total_skipped = 0

    with open(LOG_FILE, 'w', newline='') as csvfile, Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), console=console) as progress:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Name', 'Category', 'Subcategory', 'Slug'])

        for file in selected_files:
            file_path = os.path.join(COLLECTIONS_DIR, file)
            logger.info(f"Processing file: [bold blue]{file}[/bold blue]")
            new, skipped = process_file(file_path, csv_writer, progress)
            total_new += new
            total_skipped += skipped
            logger.info(f"File {file} processed. New materials: [bold green]{new}[/bold green], Skipped: [bold yellow]{skipped}[/bold yellow]")

    logger.info(f"Task completed. Total new materials added: [bold green]{total_new}[/bold green]")
    logger.info(f"Total materials skipped (already in database): [bold yellow]{total_skipped}[/bold yellow]")

if __name__ == "__main__":
    main()