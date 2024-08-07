import os
files_to_combine = [
    "./matlas-wikiapp/api/search/route.js",
    "./matlas-wikiapp/api/insert-material.js",
    "./matlas-wikiapp/materials/[id]/edit/page.js",
    "./matlas-wikiapp/materials/[id]/page.js",
    "./matlas-wikilib/supabaseClient.js",
    "./matlas-wikiapp/materials/page.js",
    "./matlas-wikiapp/profile/page.js",
    "./matlas-wikiapp/layout.js",
    "./matlas-wikiapp/page.js"
]
output_file = "combined_code.txt"
with open(output_file, 'w') as outfile:
    for file_path in files_to_combine:
        outfile.write(f"/{file_path}\n")
        with open(file_path, 'r') as infile:
            outfile.write(infile.read())
            outfile.write("\n\n")
