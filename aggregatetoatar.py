import json
import os

files = os.path.join(os.path.dirname(__file__), "AggregateToAtarRaws")
filesPath = os.listdir(files)

years = {}

for filename in filesPath:
    allowed_lines = []
    filepath = os.path.join(files, filename)
    with open(filepath) as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            line_valid = True
            for index in range(len(line)):
                char = line[index]
                skipSpace = False
                if char != " " and char != "." and not char.isdigit():
                    line_valid = False
                    break
            if line_valid:
                allowed_lines.append(line.split(' ')[1])

    years[filename[15:19]] = allowed_lines

print(years)
with open("AggregateToAtar.json", "w") as f:
    json.dump(years, f, indent=4)
    #json.dump(subjects, f, indent=4)