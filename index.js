let container = document.getElementById("container")

let elementsPerRow = 7 

let scalingReport = undefined

rows = []


let dropdown = undefined

let subjects = []

let aggregateRowCells = []

class Subject{
    constructor(compulsoryEnglish=false){
        this.cells = []
        this.rawScore = 30
        this.scaledSS = []
        this.compulsoryEnglish = compulsoryEnglish
    }
}
function getValidSubjects(textFilter, englishOnly=false){
    let yearSubjects = scalingReport["2023"]

    let validSubjects = []
    for(let i = 0; i < yearSubjects.length; i++){
        let subject = yearSubjects[i]
        if(englishOnly && !(subject.subjectName.toLowerCase().includes("english") || subject.subjectName.toLowerCase().includes("literature"))){
            continue
        }
        if(subject.subjectName.toLowerCase().includes(textFilter.toLowerCase())){
            validSubjects.push(subject)
        }
    }
    return validSubjects
}
function addDropDownItem(text, callback){
    let subjectDiv = document.createElement("div")
    subjectDiv.innerText = text
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
function populatePage(){
    for(let k = 0; k < subjects.length; k++){
        let subjectObj = subjects[k]
        if(subjectObj.subject == undefined){
            continue
        }
        subjectObj.scaledSS = []
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
                    subjectObj.scaledSS.push(scaledSS)
                    cell.innerText = scaledSS
                    break
                }
            }
        }
    }
    for(let i = 0; i < aggregateRowCells.length; i++){
        let cell = aggregateRowCells[i]
        let sum = 0
        for(let j = 0; j < subjects.length; j++){
            let subjectObj = subjects[j]
            if(subjectObj.subject == undefined){
                continue
            }
            let scaledSS = subjectObj.scaledSS[i]
            sum += scaledSS
        }
        cell.innerText = sum
    }
    
}
function handleClick(input, subject, subjectObj){
    subjectObj.subject = subject
    dropdown.remove()
    input.value = subject.subjectName
    populatePage()
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
function createSubjectCell(columnIndex, cell, subjectObj){
    switch (columnIndex){
        //add subject selector
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
        //add raw score input
        case 1:
            let rangeField = document.createElement("input")
            rangeField.type = "number"
            rangeField.min = 0
            rangeField.max = 50
            rangeField.value = 30
            rangeField.addEventListener("input", (event) => {
                subjectObj.rawScore = event.target.value
                populatePage()
            })
            cell.appendChild(rangeField)
            break
        //add scaled score cells for all other cells
        default:
            cell.innerText = "-"
    }

}
function addSubjectRow(compulsoryEnglish){
    //let row = document.createElement("div")
    //row.classList.add("row")
    rows.push([])
    let subjectObj = new Subject(compulsoryEnglish)
    subjects.push(subjectObj)
    for (let i = 0; i < elementsPerRow; i++) {
        
        let cell = document.createElement("div")
        createSubjectCell(i, cell, subjectObj)
        rows[rows.length-1].push(cell)
        cell.classList.add("cell")
        container.appendChild(cell)
        subjectObj.cells.push(cell)
        
    }
}
function addStaticRow(headers){
    for(let i = 0; i < headers.length; i++){
        let cell = document.createElement("div")
        cell.innerText = headers[i]
        cell.classList.add("cell")
        cell.classList.add("headerCells")
        container.appendChild(cell)
    }
}
function addAggregateRow(){

    for(let i = 0; i < elementsPerRow; i++){
        let cell = document.createElement("div")
        cell.classList.add("cell")
        if(i==1){
            cell.innerText = "Aggregate"
        }
        container.appendChild(cell)
        if(i > 1){
            aggregateRowCells.push(cell)
        }  
    }
}
addStaticRow(["", "Raw Score", "2019 Scaled SS", "2020 Scaled SS", "2021 Scaled SS", "2022 Scaled SS", "2023 Scaled SS"])
for (let i = 0; i < 6; i++) {
    //first row is compulsory english so i==0 is true for first column
    addSubjectRow(i==0)
}
addAggregateRow()

fetch("/ScalingReport.json").then((response) => response.json()).then((data) => {
    scalingReport = data
})

document.addEventListener("click", (event) => {
    if(dropdown && event.target.parentElement != dropdown.parentElement){
        dropdown.remove()
    }
})
