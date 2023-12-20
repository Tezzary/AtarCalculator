let container = document.getElementById("container")

let elementsPerRow = 7 

let scalingReport = undefined

rows = []


let dropdown = undefined

let subjects = []

class Subject{
    constructor(compulsoryEnglish=false){
        this.cells = []
        this.rawScore = 0
        this.scaledSS = []
        this.compulsoryEnglish = compulsoryEnglish
    }
}
function getValidSubjects(text, englishOnly=false){
    let yearSubjects = scalingReport["2023"]

    let validSubjects = []
    for(let i = 0; i < yearSubjects.length; i++){
        let subject = yearSubjects[i]
        if(englishOnly && !(subject.subjectName.toLowerCase().includes("english") || subject.subjectName.toLowerCase().includes("literature"))){
            continue
        }
        if(subject.subjectName.toLowerCase().includes(text.toLowerCase())){
            validSubjects.push(subject)
        }
    }
    return validSubjects
}
function addDropDownItem(text, callback){
    let subjectDiv = document.createElement("div")
    subjectDiv.innerText = text
    subjectDiv.classList.add("dropdown-item")
    subjectDiv.addEventListener("click", (event) => {
        callback(event)
    })
    dropdown.appendChild(subjectDiv)
}
function activateDropDown(parent){
    if(dropdown){
        dropdown.remove()
    }
    dropdown = document.createElement("div")
    dropdown.classList.add("dropdown")
    parent.appendChild(dropdown)
}
function handleTyping(text, input, subjectObj){
    let validSubjects = getValidSubjects(text, subjectObj.compulsoryEnglish)
    let perfectMatch = undefined
    for(let i = 0; i < validSubjects.length; i++){
        let subject = validSubjects[i]
        if(subject.subjectName.toLowerCase() == text.toLowerCase()){
            perfectMatch = subject
            break
        }
    }
    if(perfectMatch){
        input.value = perfectMatch.subjectName
        subjectObj.subject = perfectMatch
        updateScaledScores(subjectObj)
        return
    }
    activateDropDown(input.parentElement)
    dropdown.innerHTML = ""
    if(validSubjects.length == 0){
        addDropDownItem("No Subjects Found...", (event) => {})
    }
    for(let i = 0; i < validSubjects.length; i++){
        let subject = validSubjects[i]
        addDropDownItem(subject.subjectName, (event) => {
            handleClick(input, subject, subjectObj)
        })
        
    }
}
function updateScaledScores(subjectObj){
    if (subjectObj.subject == undefined){
        return
    }
    for(let i = 2; i < subjectObj.cells.length; i++){
        let cell = subjectObj.cells[i]
        let year = 2019 + i - 2
        let subject = scalingReport[year].find(subject => subject.subjectName == subjectObj.subject.subjectName)
        let baseline = [20, 25, 30, 35, 40, 45, 50]
        for(let j = 0; j < baseline.length; j++){
            if(subjectObj.rawScore <= baseline[j]){

                if (j == 0){
                    let scaledSS = subjectObj.rawScore - (baseline[j] - subject.subjectScalingData[j])
                    if (scaledSS < 0){
                        scaledSS = 0
                    }
                    cell.innerText = scaledSS
                    break
                }
                let offset = subjectObj.rawScore - baseline[j - 1]
                let diff = baseline[j] - baseline[j - 1]
                let percent = offset / diff
                console.log(percent)
                let scaledSS = subject.subjectScalingData[j - 1] + percent * (subject.subjectScalingData[j] - subject.subjectScalingData[j - 1])
                if (scaledSS < 0){
                    scaledSS = 0
                }
                cell.innerText = scaledSS
                break
            }
        }
    }
}
function handleClick(input, subject, subjectObj){
    subjectObj.subject = subject
    dropdown.remove()
    input.value = subject.subjectName
    updateScaledScores(subjectObj)
}
function handleTextActivation(event, subjectObj){
    let input = event.target
    let parent = input.parentElement
    activateDropDown(parent)
    let validSubjects = getValidSubjects(input.value, subjectObj.compulsoryEnglish)
    for(let i = 0; i < validSubjects.length; i++){
        let subject = validSubjects[i]
        addDropDownItem(subject.subjectName, (event) => {
            handleClick(input, subject, subjectObj)
        })
    }
}
function handleColumn(index, cell, subjectObj){
    switch (index){
        case 0:
            let input = document.createElement("input")
            input.type = "text"
            input.addEventListener("click", (event) => {
                handleTextActivation(event, subjectObj)
            })
            input.addEventListener("input", (event) => {
                let text = event.target.value
                handleTyping(text, input, subjectObj)
            })
            cell.appendChild(input)
            break
        case 1:
            let rangeField = document.createElement("input")
            rangeField.type = "number"
            rangeField.min = 0
            rangeField.max = 50
            rangeField.value = 0
            rangeField.addEventListener("input", (event) => {
                subjectObj.rawScore = event.target.value
                updateScaledScores(subjectObj)
            })
            cell.appendChild(rangeField)
            break
        default:
            cell.innerText = "-"
    }

}
function addRow(compulsoryEnglish){
    //let row = document.createElement("div")
    //row.classList.add("row")
    rows.push([])
    let subjectObj = new Subject(compulsoryEnglish)
    subjects.push(subjectObj)
    for (let i = 0; i < elementsPerRow; i++) {
        
        let cell = document.createElement("div")
        handleColumn(i, cell, subjectObj)
        rows[rows.length-1].push(cell)
        cell.classList.add("cell")
        container.appendChild(cell)
        subjectObj.cells.push(cell)
        
    }
}
function addHeader(headers){
    for(let i = 0; i < headers.length; i++){
        let cell = document.createElement("div")
        cell.innerText = headers[i]
        cell.classList.add("cell")
        container.appendChild(cell)
    }
}
addHeader(["", "Raw Score", "2019 Scaled SS", "2020 Scaled SS", "2021 Scaled SS", "2022 Scaled SS", "2023 Scaled SS"])
for (let i = 0; i < 6; i++) {
    addRow(i==0)
}

fetch("/ScalingReport.json").then((response) => response.json()).then((data) => {
    scalingReport = data
})

document.addEventListener("click", (event) => {
    if(dropdown && event.target.parentElement != dropdown.parentElement){
        dropdown.remove()
    }
})
