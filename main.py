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

files = os.path.join(os.path.dirname(__file__), "ScalingReportRaws")
filesPath = os.listdir(files)
years = {}
for filename in filesPath:
    subjects = []
    filepath = os.path.join(files, filename)
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


with open("ScalingReport.json", "w") as f:
    json.dump(years, f, indent=4)
    #json.dump(subjects, f, indent=4)