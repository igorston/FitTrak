import sys

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find the <script> and </script> tags
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '<script>' in line and start_idx == -1:
        start_idx = i
    if '</script>' in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx]
    new_lines.append('    <script src="js/data.js"></script>\n')
    new_lines.append('    <script src="js/app.js"></script>\n')
    new_lines.extend(lines[end_idx+1:])
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Replaced script tags successfully.")
else:
    print("Could not find <script> tags.")
