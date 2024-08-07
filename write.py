import os

# Define the files to be combined
files_to_combine = [
    "/app/api/search/route.js",
    "/app/api/insert-material.js",
    "/app/materials/[id]/edit/page.js",
    "/app/materials/[id]/page.js",
    "/app/materials/edit/page.js",
    "/app/materials/page.js",
    "/app/profile/page.js",
    "/app/layout.js",
    "/app/page.js"
]

# Output file
output_file = "combined_code.txt"

with open(output_file, 'w') as outfile:
    for file_path in files_to_combine:
        # Write the file path
        outfile.write(f"/{file_path}\n")
        
        # Write the file content
        with open(file_path, 'r') as infile:
            outfile.write(infile.read())
            outfile.write("\n\n")
