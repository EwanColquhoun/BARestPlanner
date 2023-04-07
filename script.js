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
let extra = false
let calc = document.getElementById('calc')
let results = document.getElementById('results-p')
let newResults = document.getElementById('new-results-p')

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
    let zRepTime = hasDST(repTime)
    // let blockTime = raw_blockTime.value
    let fltTime = raw_fltTime.value
    let toTime = raw_toTime.value
    let tiTime = raw_tiTime.value
    let acc = raw_acc.value
    let crew = raw_crew.value
    let dest = raw_dest.value
    let eobt = raw_eobt.value
    let sectors = raw_sectors.value

    let blockTime = getBlockTime(fltTime, tiTime, toTime)
    displayBlockTime(blockTime)
    console.log(repTime, blockTime, acc, sectors, crew, dest, eobt)
    let mFdp = fdp(zRepTime, sectors, dest, crew)
    // console.log(mFdp, 'mfdp')
    let latest = latestOnBlock(zRepTime, mFdp)
    // console.log(latest, dur, 'latest, dur')
    let lastPush = lastOffBlocks(latest, blockTime)
    let [pilots, newFdp, restRqd, predFDP, extra] = extraPilot(mFdp, eobt, blockTime, zRepTime, crew)
    // console.log(pilots, 'pilots')
    display(blockTime,acc,mFdp, latest, lastPush)
    if (extra == true) {
        let lastTotRevised = lastOffBlocksRevised(mFdp, newFdp, blockTime, lastPush, zRepTime)
        console.log(extra, 'extra')
        console.log(newFdp, 'extra NEW FDP')
        console.log(mFdp, 'extra NEW mFDP')
        newDisplay( pilots, newFdp, restRqd, predFDP, lastTotRevised);
    } else {
        console.log(extra, 'NO extra')
        noExtra(newFdp, lastPush);
    }
    
};

function display (blockTime,acc,mFdp, latest, lastPush) {
    results.innerHTML = `<span>
    Report Time (Local): ${raw_repTime.value}<br>
    Block time:${blockTime}.<br>
    Acclimatised: ${acc}<br>
    MAX FDP: ${mFdp}<br>
    Latest off blocks ${lastPush}z<br>
    Latest on blocks: ${latest}z<br>
    </span>
    `
}

function newDisplay (pilots, newFdp, restRqd, predFDP, lastOffBlocksRevised){
    console.log('new Display')
    newResults.innerHTML = `<span>
    <br>
    Required Crew compliment: ${pilots}<br>
    New FDP: ${predFDP}<br>
    New max FDP: ${newFdp}<br>
    Revised latest off blocks: ${lastOffBlocksRevised}z<br>
    Rest Required: ${restRqd}<br>
    </span>`
}

function noExtra(newFdp, lastPush){
    newResults.innerHTML = `<span>
    <br>
    No additional crew required <br>
    Max FDP: ${newFdp}<br>
    Latest off blocks: ${lastPush}<br>
    </span>`
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
    let mfdpCalc = ''
    if (crew == "2"){
        if (dest == "USA & Canada") {
            if ("06:00" <= rt && rt <= "07:59"){
                mfdpCalc = sixToEight[s]
                return mfdpCalc
            } else if ("0800" <= rt && rt <= "12:59"){
                mfdpCalc = eightToOne[s]
                return mfdpCalc
            } else if ("1300" <= rt && rt <= "17:59"){
                mfdpCalc = oneToSix[s]
                return mfdpCalc
            } else if ("1800" <= rt && rt <= "21:59"){
                mfdpCalc = sixToTen[s]
                return mfdpCalc
            } else {
                mfdpCalc = tenToSix[s]
                return mfdpCalc
            }
        } else {
            if ("06:00" <= rt && rt <= "07:59"){
                mfdpCalc = sixToEightOther[s]
                return mfdpCalc
            } else if ("0800" <= rt && rt <= "12:59"){
                mfdpCalc = eightToOneOther[s]
                return mfdpCalc
            } else if ("1300" <= rt && rt <= "17:59"){
                mfdpCalc = oneToSixOther[s]
                return mfdpCalc
            } else if ("1800" <= rt && rt <= "21:59"){
                mfdpCalc = sixToTenOther[s]
                return mfdpCalc
            } else {
                mfdpCalc = tenToSixOther[s]
                return mfdpCalc
            }
        } 
    } else if (crew == "3"){
        if (dest == "USA & Canada") {
            if ("06:00" <= rt && rt <= "07:59"){
                mfdpCalc = luxon.DateTime.fromISO(sixToEight[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("0800" <= rt && rt <= "12:59"){
                mfdpCalc = luxon.DateTime.fromISO(eightToOne[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("1300" <= rt && rt <= "17:59"){
                mfdpCalc = luxon.DateTime.fromISO(oneToSix[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("1800" <= rt && rt <= "21:59"){
                mfdpCalc = luxon.DateTime.fromISO(sixToTen[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else {
                mfdpCalc = luxon.DateTime.fromISO(tenToSix[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            }
        } else {
            if ("06:00" <= rt && rt <= "07:59"){
                mfdpCalc = luxon.DateTime.fromISO(sixToEightOther[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("0800" <= rt && rt <= "12:59"){
                mfdpCalc = luxon.DateTime.fromISO(eightToOneOther[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("1300" <= rt && rt <= "17:59"){
                mfdpCalc = luxon.DateTime.fromISO(oneToSixOther[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else if ("1800" <= rt && rt <= "21:59"){
                mfdpCalc = luxon.DateTime.fromISO(sixToTenOther[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            } else {
                mfdpCalc = luxon.DateTime.fromISO(tenToSixOther[s]).plus({hour: '3'}).toFormat('T')
                return mfdpCalc
            }
        }
    } if (crew == "4"){
        mfdpCalc = "18:00"
        return mfdpCalc
    } 
}

function latestOnBlock(repTime, mFdp){
    let max = mFdp.split(':');

    let mFdpTime = luxon.Duration.fromObject({hours: max[0], minutes: max[1]})
    let newDur = luxon.Duration.fromISO(mFdpTime).minus({hours: '0', minutes: '30'})
    let latestBlock = luxon.DateTime.fromISO(repTime).plus(newDur).toFormat('T')
    return latestBlock
}

function lastOffBlocks(latest, blockTime){

    let splitBlock = blockTime.split(':');
    let dur = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
    let lastPushTime = luxon.DateTime.fromISO(latest).minus(dur).toFormat('T')
 
    return lastPushTime
}

function lastOffBlocksRevised(mFdp, newFdp, blockTime, lastPush, repTime){
    let lastBlockTime = '';
    if (mFdp == newFdp){
        lastBlockTime = lastPush
    } else {
        let newOn = latestOnBlock(repTime, newFdp)
        lastBlockTime = lastOffBlocks(newOn, blockTime)
    }
    return lastBlockTime
}

function extraPilot(mFdp, eobt, blockTime, zRep, crew){
	
    let boxA = ''
    let boxB = ''
    let boxC = ''
    if (crew == '2'){
        boxA = luxon.DateTime.fromISO(mFdp).plus({minutes: '30'}).toFormat('T')
        boxB = luxon.DateTime.fromISO(boxA).plus({hour: '1'}).toFormat('T')
        boxC = luxon.DateTime.fromISO(boxA).plus({hour: '3'}).toFormat('T')
        console.log(boxA, boxB, boxC)
    }
	// let boxD = luxon.DateTime.fromISO(mFdp).plus({hour: '5'}).toFormat('T')
	let restRqd = '' 		//maybe needs these three variables out of function scope.
	let newFdp = ''
    let nCrew = ''

    // console.log(eobt, 'eobt')
    // console.log(mFdp, 'mfdp from inside extra')
    // console.log(blockTime, 'blocktime')
    let splitBlock = blockTime.split(':')
    console.log(splitBlock, 'splitblock')
    let durBlock = luxon.Duration.fromObject({hours: splitBlock[0], minutes: splitBlock[1]})
    // predicted duty time =  (eobt+block) - mfdpCalc time
    console.log(durBlock, 'durblock')
    console.log(eobt, 'eobt')
    let eobtBlock = luxon.DateTime.fromISO(eobt).plus(durBlock).toFormat('T') //ERROR with the duration of the block time.
    console.log(eobtBlock, 'eobtBlock')
    // let zmfdp = hasDST(mfdpCalcTime)
    let pfdp = getDiff(eobtBlock, zRep)
    // let luxonPFDP = luxon.DateTime.fromISO(pfdp).toFormat('T')
    // console.log(luxonPFDP, 'luxonpfdp')
    console.log(pfdp, 'pfdp')
    console.log(mFdp, 'mfdp')

    if (crew=='2' && pfdp > mFdp && pfdp <= boxA){
		newFdp = mFdp
		restRqd = 'Minimum rest 12 hours.'
		nCrew = '3rd Pilot'
        console.log('2A')
        extra = true
	} else if (crew=='2' && pfdp > boxA && pfdp <= boxB){
		newFdp = mFdp
		restRqd = '2LN after flight.'
		nCrew = '3rd Pilot'
        console.log('2b')
        extra = true
	} else if (crew=='2' && pfdp > boxB && pfdp <= boxC){
		newFdp = mFdp
		restRqd = '2LN before if time zone change greater than 5 hours. 2LN after.'
		nCrew = '3rd Pilot'
        console.log('2c')
        extra = true
	} else if (crew=='3' && pfdp > mFdp){
		newFdp = "18:00"
		restRqd = '2LN before and after.'
		nCrew = '4th Pilot'
        console.log('3')
        extra = true
	} else if (crew=='2' && pfdp < mFdp) {
        newFdp = mFdp
		restRqd = 'Minimum rest 12 hours.'
		nCrew = '2 Pilots'
        console.log('2')
    } else {
        newFdp = mFdp
		restRqd = 'Minimum rest 12 hours/Or FDP if longer'
		nCrew = 'Current'
        console.log('else')
    }

    return [nCrew, newFdp, restRqd, pfdp, extra]
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
            // console.log('top')
            timeDiff = 86400000 + timeDiff;
            hours = timeDiff/3600000
            if (hours % 1 == '0'){
                minutes = '00'
            } else {
                let timeString = hours.toString().split('.')
                // console.log(timeString, 'ts')
                hours = timeString[0]
                let longMin = timeString[1] *6
                minutes = longMin.toString().slice(0,2)
                // minutes = Math.trunc(longMin)
                // console.log(longMin, 'longmin')
            }
         } else {
            // console.log('bottom')

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

function hasDST(mfdpCalcTime){
    let z = luxon.DateTime.fromISO(mfdpCalcTime)
    if (z.isInDST) {
        let zRep = luxon.DateTime.fromISO(mfdpCalcTime).minus(3600000).toFormat('T')
        console.log('DST')
        return zRep
    } else {
        console.log('no dst')
        return z
    }

}