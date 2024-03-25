import json
import os

files = os.path.join(os.path.dirname(__file__), "AggregateToAtarRaws")
filesPath = os.listdir(files)

jsons_dir = os.path.join(os.path.dirname(__file__), "jsons")

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
with open("jsons/AggregateToAtar.json", "w") as f:
    json.dump(years, f, indent=4)
with open("jsons/AggregateToAtar.min.json", "r") as f:
    json.dump(years, f)

with open(os.path.join(jsons_dir, "AggregateToAtar.min.json"), "w") as f:
    json.dump(years, f, indent=4)
with open("jsons/AggregateToAtar.min.json", "r") as f:
    json.dump(years, f)