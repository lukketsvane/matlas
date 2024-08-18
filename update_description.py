import os
import json
import time
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
- No more than 1000 tokens.
- Be concise yet highly informative.
- Avoid typical OpenAI phrasing (e.g., "however," "in conclusion"). Do NOT include a summary at the end.
- DO NOT HAVE A CONCLUSION END PARAGRAPH!"""

def generate_description(material_name):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Create a comprehensive and engaging description for {material_name} that embodies the spirit of Matlas and advances understanding in materials science. Follow the guidelines provided, tailoring the content to the unique characteristics of {material_name}."}
            ],
            max_tokens=1000,
            n=1,
            temperature=0.8,
            frequency_penalty=0.2,
            presence_penalty=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating description for {material_name}: {str(e)}")
        return None

def update_supabase(material_name, description):
    try:
        result = supabase.table("materials").update({"description": description}).eq("name", material_name).execute()
        print(f"Successfully updated {material_name}" if result.data else f"No matching record found for {material_name}")
    except Exception as e:
        print(f"Error updating Supabase for {material_name}: {str(e)}")

def main():
    auto_process = False
    for material in materials:
        material_name = material["name"]
        print(f"\nProcessing: {material_name}")
        
        if not auto_process:
            user_input = input("Press Enter to update description, 'S' to skip, or 'A' to auto-process all: ").strip().lower()
            if user_input == 's':
                print(f"Skipping {material_name}")
                continue
            elif user_input == 'a':
                auto_process = True
        
        description = generate_description(material_name)
        if description:
            update_supabase(material_name, description)
        
        time.sleep(2)

if __name__ == "__main__":
    main()
