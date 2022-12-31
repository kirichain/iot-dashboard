var express = require('express');
var router = express.Router();

//For storage raw topic data 
var sysCtrl = [];
var eventCnt = [];
var eventComSewCnt = [];
var eventNfcUid = [];
var eventMchnTime = [];

var renderParams = [];

var today = new Date();
var serverScanningStartingTimestamp = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var timestamp;

var tempIotMac, tempStatus, tempDevice, tempIndex, tempGeneralMachine, tempComSewachine, tempWorker, tempUid;

var device = [];
var onlineDevice = [];
var offlineDevice = [];
var lostConnDevice = [];

//The arrays that have not 'daily' in name are used for counting, 'daily' means realtime data in production 
var generalMachine = [];
var generalMachineDaily = [];
var comSewMachine = [];
var comSewMachineDaily = [];

var workerUID = [];
var workerDaily = [];

var deviceCount = 0;
var onlineDeviceCount = 0;
var offlineDeviceCount = 0;
var lostConnDeviceCount = 0;

var generalMachineCount = 0;
var comSewMachineCount = 0;
var generalMachineOutputCount = 0;
var generalMachineDefectCount = 0;
var comSewMachineOutputCount = 0;
var generalMachineDefectCount = 0;
var comSewMachineDefectCount = 0;
var generalMachineProductCount = 0;
var comSewMachineProductCount = 0;
var generalMachineTarget = 0;
var comSewMachineTarget = 0;

var totalProducts = 0;
var totalOutputs = 0;
var totalDefects = 0;

var workerCount = 0;

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://125.234.135.55');
const topicName = '/SysCtrl';
const topicNameArray = ['/SysCtrl', '/Event/Cnt', '/Event/ComSew/Cnt', '/Event/Nfc/Uid', '/Event/Mchn_time'];

function remove_non_ascii(str) {
  if ((str === null) || (str === ''))
    return false;
  else
    str = str.toString();
  return str.replace(/[^\x20-\x7E]/g, '');
}

function checkWorkerInfoExisting(uid) {
  let isFound = false;
  //Check if worker info is existing in array, if not, push him/her info into
  isFound = workerUID.some(function (element, index, array) {
    return element == uid;
  });
  //console.log(isFound);
  if (!isFound) {
    console.log('New Worker UID is ' + uid);
    workerUID.push(uid);
    workerCount = workerUID.length;
  }
  //console.log(workerUID);
}

client.on('connect', function () {
  console.log('Connection done');
  client.subscribe(topicNameArray, function (err) {
    if (!err) {
      console.log('Subscribe to topics ' + ' done');
    }
  })
})

client.on('message', function (topic, message) {
  if (topic == '/SysCtrl') {
    tempDevice = JSON.parse(remove_non_ascii(message.toString()));

    sysCtrl.push(message.toString());

    timestamp = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    if (tempDevice !== undefined) {
      tempIotMac = tempDevice.IOT_MAC;
      let isFound = false;
      //Check if IoT device is existing in array, if not, push it into
      isFound = device.some(function (element, index, array) {
        if (element.IOT_MAC == tempIotMac) {
          if (device[index].STS !== element.STS) {
            device[index].STS = element.STS;
            device[index].timestamp = timestamp;
          }
          return true;
        } else {
          return false;
        }
      });
      //console.log(isFound);
      if (!isFound) {
        //console.log('New IoT MAC is ' + tempIotMac);
        tempDevice.timestamp = timestamp;
        device.push(tempDevice);
      }
      //Filter IoT devices that has OFF status 
      offlineDevice = device;
      onlineDevice = device;

      offlineDevice = device.filter(function (value, index, array) {
        return value.STS == 'OFF'
      });
      console.log('Updated offline devices list');
      //console.log(offlineDevice);
      //Filter IoT devices that has ON status
      onlineDevice = device.filter(function (value, index, array) {
        return value.STS == 'ON'
      });
      console.log('Updated online devices list');
      //console.log(onlineDevice);
      //Devices result
      deviceCount = device.length;
      onlineDeviceCount = onlineDevice.length;
      offlineDeviceCount = offlineDevice.length;
      lostConnDeviceCount = deviceCount - onlineDeviceCount - offlineDeviceCount;
      //console.log('Total devices are ' + deviceCount);
      //console.log('Total offline devices are ' + offlineDeviceCount);
      //console.log('Total online devices are ' + onlineDeviceCount);
      //console.log('Total lost connection devices are ' + lostConnDeviceCount);
    }
  }

  if (topic == '/Event/Cnt') {
    tempGeneralMachine = JSON.parse(remove_non_ascii(message.toString()));

    eventCnt.push(message.toString());

    if (tempGeneralMachine !== undefined) {
      //Push into daily array
      generalMachineDaily.push(tempGeneralMachine);
      tempIotMac = tempGeneralMachine.MAC;
      //Counting products this machine made
      if (tempGeneralMachine.TYPE == 'OUTPUT') {
        ++generalMachineOutputCount;
      } else if (tempGeneralMachine.TYPE == 'DEFECT') {
        ++generalMachineDefectCount;
      }
      generalMachineProductCount = generalMachineDefectCount + generalMachineOutputCount;
      //General Machine includes the worker UID that is working on, check UID and push data into array 
      if ((tempGeneralMachine.UID !== '') && (tempGeneralMachine.UID !== undefined)) {
        tempUid = tempGeneralMachine.UID;
        //console.log('We have worker uid ' + tempUid);
        checkWorkerInfoExisting(tempUid);
      }
      //Check if general machine is existing in array, if not, push it into
      let isFound = false;
      isFound = generalMachine.some(function (element, index, array) {
        return element.MAC == tempIotMac;
      });
      //console.log(isFound);
      if (!isFound) {
        //console.log('New General Machine is ' + tempIotMac);
        generalMachine.push(tempGeneralMachine);
        generalMachineCount = generalMachine.length;
      }
      //console.log(tempGeneralMachine);
    }
  }

  if (topic == '/Event/ComSew/Cnt') {
    tempComSewMachine = JSON.parse(remove_non_ascii(message.toString()));

    eventComSewCnt.push(message.toString());

    if (tempComSewMachine !== undefined) {
      //Push into daily array
      comSewMachineDaily.push(tempComSewMachine);
      tempIotMac = tempComSewMachine.MAC;
      //Counting product this machine made
      if (tempComSewMachine.TYPE == 'OUTPUT') {
        ++comSewMachineOutputCount;
      } else if (tempComSewMachine.TYPE == 'DEFECT') {
        ++comSewMachineDefectCount;
      }
      comSewMachineProductCount = comSewMachineOutputCount + comSewMachineDefectCount;
      let isFound = false;
      //Check if com sew machine is existing in array, if not, push it into
      isFound = comSewMachine.some(function (element, index, array) {
        return element.MAC == tempIotMac;
      });
      //console.log(isFound);
      if (!isFound) {
        console.log('New Com Sew Machine is ' + tempIotMac);
        comSewMachine.push(tempComSewMachine);
        comSewMachineCount = comSewMachine.length;
      }
      //console.log(tempComSewMachine);
    }
  }

  if (topic == '/Event/Nfc/Uid') {
    tempWorker = JSON.parse(remove_non_ascii(message.toString()));

    eventNfcUid.push(message.toString());

    if (tempWorker !== undefined) {
      workerDaily.push(tempWorker);
      tempUid = tempWorker.UID;
      //console.log('We have worker uid ' + tempUid);
      checkWorkerInfoExisting(tempUid);
    }
  }

  if (topic == '/Event/Mchn_time') {
    eventMchnTime.push(message.toString());
  }

  if (topic == '/Event/Nfc/Uid') {
    eventNfcUid.push(message.toString());
  }

  //Counting production in plan
  totalOutputs = generalMachineOutputCount + comSewMachineOutputCount;
  totalDefects = generalMachineDefectCount + comSewMachineDefectCount;
  totalProducts = totalOutputs + totalDefects;
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    deviceCount, onlineDeviceCount, offlineDeviceCount, lostConnDeviceCount, generalMachineCount, generalMachineTarget, generalMachineOutputCount,
    generalMachineDefectCount, generalMachineProductCount, comSewMachineTarget, comSewMachineCount, comSewMachineOutputCount, comSewMachineDefectCount, comSewMachineProductCount, workerCount, totalProducts, totalOutputs, totalDefects, serverScanningStartingTimestamp
  });
});

router.get('/raw-data', function (req, res, next) {
  res.render('raw-data', {});
})

router.get('/filtered-data', function (req, res, next) {
  res.render('filtered-data', {
    deviceCount, onlineDeviceCount, offlineDeviceCount, lostConnDeviceCount, generalMachineCount, generalMachineTarget, generalMachineOutputCount,
    generalMachineDefectCount, generalMachineProductCount, comSewMachineTarget, comSewMachineCount, comSewMachineOutputCount, comSewMachineDefectCount, comSewMachineProductCount, workerCount
  });
})

router.get('/topics/:topicName', function (req, res, next) {
  let query = req.params.topicName;

  switch (query) {
    case 'sysctrl':
      res.send(sysCtrl);
      break;
    case 'event-cnt':
      res.send(eventCnt);
      break;
    case 'event-com-sew-cnt':
      res.send(eventComSewCnt);
      break;
    case 'event-nfc-uid':
      res.send(eventNfcUid);
      break;
    case 'event-mchn-time':
      res.send(eventMchnTime);
      break;
  }
  res.status(200);
})

router.get('/data/:query', function (req, res, next) {
  let query = req.params.query;

  switch (query) {
    case 'device':
      res.send(device);
      break;
    case 'general-machine':
      res.send(generalMachine);
      break;
    case 'com-sew-machine':
      res.send(comSewMachine);
      break;
    case 'general-machine-daily':
      res.send(generalMachineDaily);
      break;
    case 'com-sew-machine-daily':
      res.send(comSewMachineDaily);
      break;
    case 'worker-uid':
      res.send(workerUID);
      break;
    case 'worker-daily':
      res.send(workerDaily);
      break;
    default:
      console.log('no matching');
  }
  res.status(200);
})

module.exports = router;
