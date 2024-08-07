import os
files_to_combine = [
    "./app/api/search/route.js",
    "./app/api/insert-material.js",
    "./app/materials/[id]/edit/page.js",
    "./app/materials/[id]/page.js",
    "./lib/supabaseClient.js",
    "./app/materials/page.js",
    "./app/profile/page.js",
    "./app/layout.js",
    "./app/page.js"
]
output_file = "combined_code.txt"
with open(output_file, 'w') as outfile:
    for file_path in files_to_combine:
        outfile.write(f"/{file_path}\n")
        with open(file_path, 'r') as infile:
            outfile.write(infile.read())
            outfile.write("\n\n")
