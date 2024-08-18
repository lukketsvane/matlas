import os
files_to_combine = [
    "./matlas-wiki/app/api/search/route.js",
    "./matlas-wiki/app/api/insert-material.js",
    "./matlas-wiki/app/materials/[slug]/edit/page.js",
    "./matlas-wiki/app/materials/[slug]/page.js",
    "./matlas-wiki/lib/supabaseClient.js",
    "./matlas-wiki/app/materials/page.js",
    "./matlas-wiki/app/info/page.js",
    "./matlas-wiki/app/profile/page.js",
    "./matlas-wiki/app/discover/page.js",

    "./matlas-wiki/app/profile/page.js",
    "./matlas-wiki/components/SearchBar.js",
    "./matlas-wiki/components/MaterialCard.js",
    "./matlas-wiki/components/Flters.js",
    "./matlas-wiki/app/layout.js",
    "./matlas-wiki/app/page.js"
]
output_file = "combined_code.txt"
with open(output_file, 'w') as outfile:
    for file_path in files_to_combine:
        outfile.write(f"/{file_path}\n")
        with open(file_path, 'r') as infile:
            outfile.write(infile.read())
            outfile.write("\n\n")
