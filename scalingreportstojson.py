import json
import os

#get all files in fir ScalingReportRaws

def handleSpace(data, line, index):
    if len(data) == 2:
        data.append("")
        return True
    elif line[index+1:index+6] == "Small":
        data[0] = False
        data.append("")
        return True
    elif line[index+1].isdigit():
        data.append("")
        return True
    return False

data_file_dir = os.path.join(os.path.dirname(__file__), "ScalingReportRaws")
data_files_in_path = os.listdir(data_file_dir)

json_file_min = os.path.join(os.path.dirname(__file__), "jsons", "ScalingReport.min.json")
json_file = os.path.join(os.path.dirname(__file__), "jsons", "ScalingReport.json")

years = {}
subjectIDNames = {}

for filename in data_files_in_path:
    subjects = []
    filepath = os.path.join(data_file_dir, filename)
    with open(filepath) as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            data = [True,""]
            for index in range(len(line)):
                char = line[index]
                skipSpace = False
                if char == " ":
                    skipSpace = handleSpace(data, line, index)
                if not skipSpace:
                    data[len(data)-1] += char
            subjects.append(data)

    subjectObjects = []
    for subject in subjects:
        if(subject[2] == "Revolutions"):
            subject[2] = "Revolutions (History)"
        subjectObject = {
            "hasScalingData": subject[0],
            "subjectID": subject[1],
            "subjectName": subject[2],
            "subjectMean": 0,
            "subjectSD": 0,
            "subjectScalingData": []
        }
        
        if subject[3][0].isdigit():
            subjectObject["subjectMean"] = float(subject[3])
            subjectObject["subjectSD"] = float(subject[4])
            for index in range(5, len(subject)):
                subjectObject["subjectScalingData"].append(int(subject[index]))
        subjectObjects.append(subjectObject)
    years[filename[13:17]] = subjectObjects

for year in years:
    for subject in years[year]:
        if subject["subjectID"] not in subjectIDNames:
            subjectIDNames[subject["subjectID"]] = []
        if subject["subjectName"] not in subjectIDNames[subject["subjectID"]]:
            subjectIDNames[subject["subjectID"]].append(subject["subjectName"])

for year in years:
    print(year)
    for i in range(len(years[year])):
        subject = years[year][i]
        subjectNames = subjectIDNames[subject["subjectID"]]
        for name in subjectNames:
            if name == subject["subjectName"]:
                continue
            subjectCopy = subject.copy()
            subjectCopy["subjectName"] = name
            years[year].append(subjectCopy)


with open(json_file, "w") as f:
    json.dump(years, f, indent=4)
with open(json_file_min, "w") as f:
    json.dump(years, f)