
let raw_depTime = document.getElementById('depTime')
let raw_blockTime = document.getElementById('blockTime')
let raw_fltTime = document.getElementById('fltTime')
let raw_toTime = document.getElementById('toTime')
let raw_acc = document.getElementById('acc')
let raw_sectors = document.getElementById('sectors')
let raw_crew = document.getElementById('crew')
let raw_dest = document.getElementById('dest')
let raw_eobt = document.getElementById('eobt') 

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


function calculate (){
    let depTime = raw_depTime.value
    let blockTime = raw_blockTime.value
    let fltTime = raw_fltTime.value
    // let toTime = raw_toTime.value
    let acc = raw_acc.value
    let sectors = raw_sectors.value
    let crew = raw_crew.value
    let dest = raw_dest.value
    let eobt = raw_eobt.value
    console.log(depTime, blockTime, acc, sectors, crew, dest, eobt)
    let mFdp = fdp(depTime, sectors, dest)
    console.log(mFdp, 'mfdp')
    let [latest, dur] = latestBlock(depTime, blockTime, mFdp)
    console.log(latest, dur, 'latest, dur')
    let lastTot = lastTo(latest, fltTime, mFdp)
    let pilot = extraPilot(mFdp, eobt, dur)
    display(depTime,blockTime,sectors,acc,crew,mFdp, latest, lastTot, pilot)

};

function display (depTime,blockTime,sectors,acc,crew,mFdp, latest, lastTot, pilot) {
    results.innerHTML = `<span>
    Report Time (Local): ${depTime}<br>
    Block time:${blockTime}.<br>
    Crew: ${crew}<br>
    Sectors: ${sectors}<br>
    Acclimatised: ${acc}<br>
    MAX FDP: ${mFdp}<br>
    Latest on blocks: ${latest}<br>
    Latest Take-off ${lastTot}
    ${pilot}
    </span>
    `
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

function latestBlock(depTime, blockTime, mFdp){
    // let btime = blockTime.split(':');
    let max = mFdp.split(':');

    // var dur = luxon.Duration.fromObject({hours: btime[0], minutes: btime[1]})
    // let updated = luxon.DateTime.fromISO(depTime).plus(dur).toString()
    let mFdpTime = luxon.Duration.fromObject({hours: max[0], minutes: max[1]})
    let newDur = luxon.Duration.fromISO(mFdpTime).plus({hours: '0'}).toFormat('hhmm')

    let latestBlock = luxon.DateTime.fromISO(depTime).plus(mFdpTime).toFormat('T')
    return [latestBlock, newDur]
}

function lastTo(latest, fltTime, mFdp){
    let ftime = fltTime.split(':');
    let dur = luxon.Duration.fromObject({hours: ftime[0], minutes: ftime['1']})
    let lastToTime = luxon.DateTime.fromISO(latest).minus(dur).toFormat('T')
    console.log(lastToTime, 'last TO time')
    return lastToTime
}


function extraPilot(mFdp, eobt){
	
	let boxA = luxon.DateTime.fromISO(mFdp).plus({minutes: '30'}).toFormat('T')
	let boxB = luxon.DateTime.fromISO(boxA).plus({hour: '1'}).toFormat('T')
	let boxC = luxon.DateTime.fromISO(boxA).plus({hour: '3'}).toFormat('T')
	let boxD = luxon.DateTime.fromISO(boxA).plus({hour: '5'}).toFormat('T')
	let restRqd = '' 		//maybe needs these three variables out of function scope.
	let newFdp = ''
	let rcmd = ''
    let nCrew = ''
    // let newEobt = luxon.DateTime.fromObject({eobt}).toISOTime({suppressSeconds: true})
    // let newEobt = luxon.DateTime.fromISOTime({eobt}).toObject().toFormat('T')
    let estblock = eobt.split(':');
    // let newEobt = luxon.DateTime.fromObject({hours: estblock[0], minutes: estblock['1']}).toFormat('T')
    // console.log('new eobt', newEobt)
    // console.log(dur, 'dur')
   console.log(eobt, 'eobt')
   console.log(mFdp, 'mfdp')
    // let splitmFdp = mFdp.split(':');
    // let updatedFdp = luxon.DateTime.fromObject({hours: splitmFdp[0], minutes: splitmFdp['1']}).toFormat('T')
    // console.log(updatedFdp, 'updatedFDP')
    // let pfdp = luxon.DateTime.fromObject({hours: estblock[0], minutes: estblock['1']}).plus({updatedFdp}).toFormat('T')
    let pfdp = luxon.DateTime.fromISOTime(eobt).plus(mFdp).toFormat('T')
    console.log(pfdp, 'pfdp')

	if (crew=='3' ){
		newFdp = boxD
		restRqd = '2LN before and after.'
		nCrew = '4th Pilot'
        console.log('3')
	} else if (crew=='2' && pfdp > mFdp && pfdp <= boxA){
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
	}
	
	rcmd = `
		${nCrew} required.
		New max FDP is ${newFdp},
		Rest required is ${restRqd}	
	`
	return rcmd
} 



// export {calculate}