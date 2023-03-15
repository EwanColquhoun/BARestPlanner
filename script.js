let raw_depTime = document.getElementById('depTime')
let raw_blockTime = document.getElementById('blockTime')
let raw_fltTime = document.getElementById('fltTime')
let raw_acc = document.getElementById('acc')
let raw_sectors = document.getElementById('sectors')
let raw_crew = document.getElementById('crew')
let raw_dest = document.getElementById('dest')
let raw_eobt = document.getElementById('eobt') 
let raw_toTime = document.getElementById('taxiOutTime') 
let raw_tiTime = document.getElementById('taxiInTime') 

let crewDiv = document.getElementById('crew-content')

let calc = document.getElementById('calc')
let results = document.getElementById('results-p')

let sixToEight = {1:"12:00", 2:"11:15", 3:"10:30", 4:"09:45"}
let eightToOne = {1:"12:00", 2:"12:00", 3:"12:00", 4:"11:15"}
let oneToSix = {1:"12:00", 2:"11:45", 3:"11:00", 4:"10:15"}
let sixToTen = {1:"11:30", 2:"10:45", 3:"10:00", 4:"09:15"}
let tenToSix = {1:"10:30", 2:"09:45", 3:"09:00", 4:"08:30"}
let USA = [sixToEight, eightToOne, oneToSix, sixToTen, tenToSix]

let sixToEightOther = {1:"12:00", 2:"11:15", 3:"10:30", 4:"09:45"}
let eightToOneOther = {1:"12:00", 2:"12:00", 3:"12:00", 4:"11:15"}
let oneToSixOther = {1:"12:00", 2:"11:15", 3:"10:30", 4:"09:45"}
let sixToTenOther = {1:"11:00", 2:"10:15", 3:"09:30", 4:"08:45"}
let tenToSixOther = {1:"10:00", 2:"09:15", 3:"08:30", 4:"08:00"}
let Other = [sixToEightOther,
    eightToOneOther,
    oneToSixOther,
    sixToTenOther,
    tenToSixOther]

window.addEventListener("load", init(raw_crew, raw_sectors))

function init(raw_crew, raw_sectors){
    let crew = raw_crew.value
    let crewDiv = document.getElementById('crew-content')
    let sectors = raw_sectors.value
    let sectorsDiv = document.getElementById('sectors-content')
    
    sectorsDiv.innerHTML=`
    <p>${sectors}</p>`
    
    crewDiv.innerHTML=`
    <p>${crew}</p>`
}


function calculate (){
    let depTime = raw_depTime.value
    // let blockTime = raw_blockTime.value
    let fltTime = raw_fltTime.value
    let toTime = raw_toTime.value
    let tiTime = raw_tiTime.value
    let acc = raw_acc.value
    let crew = raw_crew.value
    let dest = raw_dest.value
    let eobt = raw_eobt.value
    let sectors = raw_sectors.value
    // console.log(depTime, blockTime, acc, sectors, crew, dest, eobt)
    let blockTime = getBlockTime(fltTime, tiTime, toTime)
    let mFdp = fdp(depTime, sectors, dest)
    console.log(mFdp, 'mfdp')
    let [latest, dur] = latestOnBlock(depTime, blockTime, mFdp)
    console.log(latest, dur, 'latest, dur')
    let lastTot = lastOffBlocks(latest, blockTime)
    let [pilots, newFdp, restRqd] = extraPilot(mFdp, eobt, blockTime, depTime, crew)
    // console.log(pilots, 'pilots')
    display(depTime,blockTime,sectors,acc,crew,mFdp, latest, lastTot, pilots, newFdp, restRqd)

};

function display (depTime,blockTime,sectors,acc,crew,mFdp, latest, lastTot, pilots, newFdp, restRqd) {
    results.innerHTML = `<span>
    Report Time (Local): ${depTime}<br>
    Block time:${blockTime}.<br>
    Crew: ${crew}<br>
    Sectors: ${sectors}<br>
    Acclimatised: ${acc}<br>
    MAX FDP: ${mFdp}<br>
    Latest on blocks: ${latest}<br>
    Latest Take-off ${lastTot}<br>
    New Crew compliment: ${pilots}<br>
    New FDP: ${newFdp}<br>
    Rest Required: ${restRqd}<br>
    </span>
    `
}

function populateSec(raw_sectors){
    let sectors = raw_sectors.value
    let sectorsDiv = document.getElementById('sectors-content')
    sectorsDiv.innerHTML=`
    <p>${sectors}</p>`
}

function populateCrew(raw_crew){
    let crew = raw_crew.value
    let crewDiv = document.getElementById('crew-content')
    crewDiv.innerHTML=`
    <p>${crew}</p>`
}

function getBlockTime(fltTime, tiTime, toTime){
    let splitTin = tiTime.split(':')
    let luxontoTime = luxon.Duration.fromISOTime(toTime).toObject()
    let luxonTaxi = luxon.Duration.fromObject(luxontoTime).plus({hours: splitTin[0], minutes: splitTin[1]})
    let luxonFlt = luxon.Duration.fromISOTime(fltTime).toObject()
   
    let total = luxon.DateTime.fromObject(luxonFlt).plus(luxonTaxi).toFormat('T')

    return total
}


function fdp(dt, s, dest){
    let report = ''
    if (dest == "USA & Canada") {
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
    } else {
        if ("06:00" <= dt && dt <= "07:59"){
            report = sixToEightOther[s]
            return report
        } else if ("0800" <= dt && dt <= "12:59"){
            report = eightToOneOther[s]
            return report
        } else if ("1300" <= dt && dt <= "17:59"){
            report = oneToSixOther[s]
            return report
        } else if ("1800" <= dt && dt <= "21:59"){
            report = sixToTenOther[s]
            return report
        } else {
            report = tenToSixOther[s]
            return report
        }
    } 
}

function latestOnBlock(depTime, blockTime, mFdp){
    let max = mFdp.split(':');

    let mFdpTime = luxon.Duration.fromObject({hours: max[0], minutes: max[1]})
    let newDur = luxon.Duration.fromISO(mFdpTime).minus({hours: '0', minutes: '30'})

    let latestBlock = luxon.DateTime.fromISO(depTime).plus(newDur).toFormat('T')
    return [latestBlock, newDur]
}

function lastOffBlocks(latest, blockTime){

    let splitBlock = blockTime.split(':');
    let dur = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock['1']})
    let lastToTime = luxon.DateTime.fromISO(latest).minus(dur).toFormat('T')
    
    
    console.log(lastToTime, 'last TO time')

    return lastToTime
}


function extraPilot(mFdp, eobt, blockTime, reportTime, crew){
	
	let boxA = luxon.DateTime.fromISO(mFdp).plus({minutes: '30'}).toFormat('T')
	let boxB = luxon.DateTime.fromISO(boxA).plus({hour: '1'}).toFormat('T')
	let boxC = luxon.DateTime.fromISO(boxA).plus({hour: '3'}).toFormat('T')
	let boxD = luxon.DateTime.fromISO(mFdp).plus({hour: '5'}).toFormat('T')
	let restRqd = '' 		//maybe needs these three variables out of function scope.
	let newFdp = ''
	let rcmd = {}
    let nCrew = ''
    // let newEobt = luxon.DateTime.fromObject({eobt}).toISOTime({suppressSeconds: true})
    // let newEobt = luxon.DateTime.fromISOTime({eobt}).toObject().toFormat('T')
    let estblock = eobt.split(':');

    console.log(eobt, 'eobt')
    console.log(mFdp, 'mfdp')
    console.log(blockTime, 'blocktime')
    let splitBlock = blockTime.split(':')
    let durBlock = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
    // predicted duty time =  (eobt+block) - report time
    let eobtBlock = luxon.DateTime.fromISO(eobt).plus(durBlock).toFormat('T')
    console.log(eobtBlock, 'eobtBlock')
    console.log('report', reportTime)

    let pfdp = getDiff(eobtBlock, reportTime)
    console.log(pfdp, 'pfdp')

    if (crew=='2' && pfdp > mFdp && pfdp <= boxA){
		newFdp = boxA
		restRqd = 'Minimum rest 12 hours.'
		nCrew = '3rd Pilot'
        console.log('2A')
	} else if (crew=='2' && pfdp > boxA && pfdp <= boxB){
		newFdp = boxB
		restRqd = '2LN after flight.'
		nCrew = '3rd Pilot'
        console.log('2b')
	} else if (crew=='2' && pfdp > boxB && pfdp <=boxC){
		newFdp = boxC
		restRqd = '2LN before if time zone change greater than 5 hours. 2LN after.'
		nCrew = '3rd Pilot'
        console.log('2c')
	} else if (crew=='3' && pfdp > boxB && pfdp <=boxC){
		newFdp = boxD
		restRqd = '2LN before and after.'
		nCrew = '4th Pilot'
        console.log('3')
	}

    return [nCrew, newFdp, restRqd] 

    } 

function getDiff(time1, time2){
        //get values
        var valuestart = time2
        var valuestop = time1
          
         //create date format          
         var timeStart = new Date("01/01/2007 " + valuestart).getTime();
         var timeEnd = new Date("01/01/2007 " + valuestop).getTime();
         
        //  console.log(valuestart, valuestop, timeStart, timeEnd, 'start, end, timestart, timeend');
         var timeDiff = timeEnd - timeStart;
         if (timeDiff < 0) {
             timeDiff = 86400000 + timeDiff;
             hours = timeDiff/3600000
             minutes = hours%60000
            //  console.log('minus')
            //  console.log(`${hours} hours, ${minutes} minutes.`)
         } else {
            // console.log('plus')
             hours = timeDiff/3600000
             minutes = hours/60
            //  console.log(`${hours} hours, ${minutes} minutes.`)
         }
         return `${hours}:${minutes}`
        
}


// export {calculate}