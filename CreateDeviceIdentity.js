'use strict';

var iothub = require('azure-iothub');

var program = require('commander');

var deviceId;
var connectionString;
//'HostName=serviceName.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=dmH89hXH3ohy10/BxvOL/7e5zLqw7/AGd5l1UgVTfnY=';


program
    .version('1.0')
    .option('-c, --connectionString <connString>', 'Specify connection string for your IoT Hub (example: "HostName=serviceName.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=dmH89hXH3o="')
    .option('-n, --deviceName <deviceName>', 'Specify device name used as device ID into Azure IoT Hub.')

.parse(process.argv);

if (!program.deviceName) {
    console.log('Missing parameter -n <deviceName>. \n Please specify a name for the new device you want to register in the IoT Hub.');
    console.log('For help use  \"node SimulatedDevice -h\"');
    process.exit(1);
} else if (!program.connectionString) {
    console.log('Missing parameter -c <connString>. \n Specify connection string for your IoT Hub (example: "HostName=serviceName.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=dmH89hXH3o="');
    console.log('For help use  \"node SimulatedDevice -h\"');
    process.exit(1);

} else {
    console.log('   Device name: ' + program.deviceName);
    console.log('   Connection string: ' + program.connectionString);
    deviceId = program.deviceName;
    connectionString = program.connectionString;
}



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
    } else if (err) {
        console.log('Error while creating new device on IoT Hub. Please verify connection string.');
        console.log('Error: ' + err);
    }
}