let raw_repTime = document.getElementById('repTime')
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

// raw_tiTime.addEventListener("change", displayBlockTime(blockTime))

function calculate (){
    let repTime = raw_repTime.value
    // let blockTime = raw_blockTime.value
    let fltTime = raw_fltTime.value
    let toTime = raw_toTime.value
    let tiTime = raw_tiTime.value
    let acc = raw_acc.value
    let crew = raw_crew.value
    let dest = raw_dest.value
    let eobt = raw_eobt.value
    let sectors = raw_sectors.value
    // console.log(repTime, blockTime, acc, sectors, crew, dest, eobt)
    let blockTime = getBlockTime(fltTime, tiTime, toTime)
    displayBlockTime(blockTime)
    let mFdp = fdp(repTime, sectors, dest, crew)
    console.log(mFdp, 'mfdp')
    let [latest, dur] = latestOnBlock(repTime, blockTime, mFdp)
    console.log(latest, dur, 'latest, dur')
    let lastTot = lastOffBlocks(latest, blockTime)
    let [pilots, newFdp, restRqd, predFDP] = extraPilot(mFdp, eobt, blockTime, repTime, crew)
    let lastTotRevised = lastOffBlocksRevised(mFdp, newFdp, blockTime, lastTot)
    // console.log(pilots, 'pilots')
    display(repTime,blockTime,acc,mFdp, latest, lastTot, pilots, newFdp, restRqd, predFDP, lastTotRevised)

};

function display (repTime,blockTime,acc,mFdp, latest, lastTot, pilots, newFdp, restRqd, predFDP, lastOffBlocksRevised) {
    results.innerHTML = `<span>
    Report Time (Local): ${repTime}<br>
    Block time:${blockTime}.<br>
    Acclimatised: ${acc}<br>
    MAX FDP: ${mFdp}<br>
    Latest off blocks ${lastTot}<br>
    Latest on blocks: ${latest}<br>
    <br>
    Required Crew compliment: ${pilots}<br>
    New FDP: ${predFDP}<br>
    New max FDP: ${newFdp}<br>
    Revised latest off blocks: ${lastOffBlocksRevised}<br>
    Rest Required: ${restRqd}<br>
    </span>
    `
}

function displayBlockTime(blockTime){
    let blockTimeHolder = document.getElementById('block-content')
    blockTimeHolder.innerHTML = `
    <p>
    Calculated block time: ${blockTime}
    </p>
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


function fdp(rt, s, dest, crew){
    let report = ''
    if (crew == "2"){
        if (dest == "USA & Canada") {
            if ("06:00" <= rt && rt <= "07:59"){
                report = sixToEight[s]
                return report
            } else if ("0800" <= rt && rt <= "12:59"){
                report = eightToOne[s]
                return report
            } else if ("1300" <= rt && rt <= "17:59"){
                report = oneToSix[s]
                return report
            } else if ("1800" <= rt && rt <= "21:59"){
                report = sixToTen[s]
                return report
            } else {
                report = tenToSix[s]
                return report
            }
        } else {
            if ("06:00" <= rt && rt <= "07:59"){
                report = sixToEightOther[s]
                return report
            } else if ("0800" <= rt && rt <= "12:59"){
                report = eightToOneOther[s]
                return report
            } else if ("1300" <= rt && rt <= "17:59"){
                report = oneToSixOther[s]
                return report
            } else if ("1800" <= rt && rt <= "21:59"){
                report = sixToTenOther[s]
                return report
            } else {
                report = tenToSixOther[s]
                return report
            }
        } 
    } else if (crew == "3"){
        if (dest == "USA & Canada") {
            if ("06:00" <= rt && rt <= "07:59"){
                report = luxon.DateTime.fromISO(sixToEight[s]).plus({hour: '3'}).toFormat('T')
                return report
            } else if ("0800" <= rt && rt <= "12:59"){
                report = luxon.DateTime.fromISO(eightToOne[s]).plus({hour: '3'}).toFormat('T')
                return report
            } else if ("1300" <= rt && rt <= "17:59"){
                report = luxon.DateTime.fromISO(oneToSix[s]).plus({hour: '3'}).toFormat('T')
                return report
            } else if ("1800" <= rt && rt <= "21:59"){
                report = luxon.DateTime.fromISO(sixToTen[s]).plus({hour: '3'}).toFormat('T')
                return report
            } else {
                report = luxon.DateTime.fromISO(tenToSix[s]).plus({hour: '3'}).toFormat('T')
                return report
            }
        } else {
            if ("06:00" <= rt && rt <= "07:59"){
                report = sixToEightOther[s]
                return report
            } else if ("0800" <= rt && rt <= "12:59"){
                report = eightToOneOther[s]
                return report
            } else if ("1300" <= rt && rt <= "17:59"){
                report = oneToSixOther[s]
                return report
            } else if ("1800" <= rt && rt <= "21:59"){
                report = sixToTenOther[s]
                return report
            } else {
                report = tenToSixOther[s]
                return report
            }
        }
    } if (crew == "4"){
        report = "18:00"
        return report
    } 
}

function latestOnBlock(repTime, blockTime, mFdp){
    let max = mFdp.split(':');

    let mFdpTime = luxon.Duration.fromObject({hours: max[0], minutes: max[1]})
    let newDur = luxon.Duration.fromISO(mFdpTime).minus({hours: '0', minutes: '30'})

    let latestBlock = luxon.DateTime.fromISO(repTime).plus(newDur).toFormat('T')
    return [latestBlock, newDur]
}

function lastOffBlocks(latest, blockTime){

    let splitBlock = blockTime.split(':');
    let dur = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
    let lastToTime = luxon.DateTime.fromISO(latest).minus(dur).toFormat('T')
    
    
    console.log(lastToTime, 'last TO time')

    return lastToTime
}

function lastOffBlocksRevised(mFdp, newFdp, blockTime, lastTot){
    let lastBlockTime = '';
    
    if (mFdp = newFdp){
        lastBlockTime = lastTot
    } else {
   
        let splitBlock = blockTime.split(':');
        let dur = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
        lastBlockTime = luxon.DateTime.fromISO(newFdp).minus(dur).toFormat('T')
    }
    
    
    console.log(lastBlockTime, 'last block time')

    return lastBlockTime
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
    let estblock = eobt.split(':');

    console.log(eobt, 'eobt')
    console.log(mFdp, 'mfdp')
    console.log(blockTime, 'blocktime')
    let splitBlock = blockTime.split(':')
    console.log(splitBlock, 'splitblock')
    let durBlock = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
    // predicted duty time =  (eobt+block) - report time
    console.log(durBlock, 'durblock')

    let eobtBlock = luxon.DateTime.fromISO(eobt).plus(durBlock).toFormat('T') //ERROR with the duration of the block time.
    console.log(eobtBlock, 'eobtBlock')
    console.log('report', reportTime)

    let pfdp = getDiff(eobtBlock, reportTime)
    let luxonPFDP = luxon.DateTime.fromISO(pfdp).toFormat('T')
    console.log(luxonPFDP, 'luxonpfdp')

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
	} else if (crew=='2' && pfdp < mFdp && pfdp <= boxA) {
        newFdp = mFdp
		restRqd = 'Minimum rest 12 hours.'
		nCrew = '2 Pilots'
        console.log('2')
    }

    return [nCrew, newFdp, restRqd, pfdp] 
}


function getDiff(time1, time2){
        //get values
        var valuestart = time2
        var valuestop = time1
          
         //create date format          
         var timeStart = new Date("01/01/2007 " + valuestart).getTime();
         var timeEnd = new Date("01/01/2007 " + valuestop).getTime();
         let hours = ''
         let minutes = ''

         var timeDiff = timeEnd - timeStart;
         if (timeDiff < 0) {
            console.log('top')
            timeDiff = 86400000 + timeDiff;
            hours = timeDiff/3600000
            let timeString = hours.toString().split('.')
            hours = timeString[0]
            let longMin = timeString[1] *6
            minutes = longMin.toString().slice(0,2)
            // minutes = Math.trunc(longMin)
            console.log(longMin, 'longmin')
         } else {
            console.log('bottom')

            hours = timeDiff/3600000
            let timeString = hours.toString().split('.')
            let longMin = timeString[1] *6
            minutes = longMin.toString().slice(0,2)
            hours = timeString[0]
            }
        let totalDiff = `${hours}:${minutes}`
        console.log(totalDiff, 'predicted fdp')
        
        return totalDiff
}
