let raw_depTime = document.getElementById('depTime')
let raw_blockTime = document.getElementById('blockTime')
let raw_acc = document.getElementById('acc')
let raw_sectors = document.getElementById('sectors')
let raw_crew = document.getElementById('crew')
let calc = document.getElementById('calc')
let results = document.getElementById('results-p')

let sixToEight = {1:"12:00", 2:"11:15", 3:"10:30", 4:"09:45"}
let eightToOne = {1:"12:00", 2:"12:00", 3:"12:00", 4:"11:15"}
let oneToSix = {1:"12:00", 2:"11:45", 3:"11:00", 4:"10:15"}
let sixToTen = {1:"11:30", 2:"10:45", 3:"10:00", 4:"09:15"}
let tenToSix = {1:"10:30", 2:"09:45", 3:"09:00", 4:"08:30"}

let USA = [sixToEight, eightToOne, oneToSix, sixToTen, tenToSix]



function calculate (){
    let depTime = raw_depTime.value
    let blockTime = raw_blockTime.value
    let acc = raw_acc.value
    let sectors = raw_sectors.value
    let crew = raw_crew.value
    console.log(depTime, blockTime, acc, sectors, crew)
    let mFdp = fdp(depTime, sectors)
    display(depTime,blockTime,sectors,acc,crew,mFdp)
    // calculate(depTime)
};

function display (depTime,blockTime,sectors,acc,crew,mFdp) {
    results.innerHTML = `
    Departure: ${depTime}\n
    Block time:${blockTime}.\n
    \n Crew: ${crew}\n
    Sectors: ${sectors}\n
    Acclimatised: ${acc}\n
    MAX FDP: ${mFdp}
    `
}

function fdp(dt, s){
    let report = ''
    let repo = ''
    if ("06:00" <= dt && dt <= "07:59"){
        report = sixToEight[s]
        return report
    } else if ("0800" <= dt && dt <= "12:59"){
        report = eightToOne[s]
        return report
    } else if ("1300" <= dt && dt <= "17:59"){
        report = oneToSix[s]
        return report
    } else if ("1800" <= dt && dt <= "21:59"){
        report = sixToTen[s]
        return report
    } else {
        report = tenToSix[s]
        return report
    }
}

// function calculate(depTime){
//     let dt = []
//     if(depTime)
// }