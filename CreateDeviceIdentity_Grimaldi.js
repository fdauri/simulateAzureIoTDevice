'use strict';

var iothub = require('azure-iothub');

var program = require('commander');

var deviceId;

program
    .version('1.0')
    .option('-n, --deviceName <deviceName>', 'Specify device name used as device ID into Azure IoT Hub.')
    .parse(process.argv);

debugger;

if (!program.deviceName) {
    console.log('Missing parameter -deviceName. Please specify a name for the new device you want to register in the IoT Hub.');
    console.log('For help use  \"node SimulatedDevice -h\"');
    process.exit(1);
} else {
    console.log('Device name: ' + program.deviceName);
    deviceId = program.deviceName;
}


var connectionString = 'HostName=GrimaldiIoTHub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=dmH89hXH3ohy10/BxvOL/7e5zLqw7/AGd5l1UgVTfnY=';

var registry = iothub.Registry.fromConnectionString(connectionString);

var device = new iothub.Device(null);
device.deviceId = deviceId;
registry.create(device, function(err, deviceInfo, res) {
    if (err) {
        printDeviceInfo(err, deviceInfo, res);
        registry.get(device.deviceId, printDeviceInfo);
    }
    if (deviceInfo) {
        printDeviceInfo(err, deviceInfo, res);
    }
});

function printDeviceInfo(err, deviceInfo, res) {
    if (deviceInfo) {
        console.log('Device ID: ' + deviceInfo.deviceId);
        console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    }
}



/*
 
Device ID: firstVirtualDeviceNode
Device key: IXZKfuYk9jM0d0IdalOtOA2pWmVFEYhqLIOru4HQQiE=

*/