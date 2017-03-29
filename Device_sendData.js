'use strict';

var querystring = require('querystring');
var http = require('http');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var program = require('commander');

var connectionString;
var timeInterval;

program
    .version('1.0')
    .option('-c, --connectionString <connString>', 'Specify device connection string generated from Azure IoT Hub service when you have added your device.')
    .option('-t, --time <timeInterval>', 'Specify time interval (in millisecond) for message sent by virtual device. Default value 1 minute.')
    .option('-u, --AlleantiaAPIurl <AlleantiaAPIurl>', 'Specify Alleantia rest uri for device.')
    .option('-d, --DeviceDescription <DeviceDescription>', 'Specify device description.')
    .option('-t, --DataType <DataType>', 'Specify device data type.')
    .option('-u, --EngUnit <EngUnit>', 'Specify device EngUnit.')
    .parse(process.argv);

debugger;

if (!program.connectionString) {
    console.log('Missing parameter -c. Please specify a connectionString for the device you want' +
        'to simulate (copy it from Azure IoT Hub device configuration).');
    console.log('For help use  \"node SimulatedDevice_ActiveEnergyImp.js -h\"');
    process.exit(1);
} else {
    console.log('Connection String passed: ' + program.connectionString);
    connectionString = program.connectionString;
}
if (program.time) {
    console.log('Time interval set: ' + program.time);
    timeInterval = parseInt(program.time, 10);
} else {
    console.log('No time interval specified. Using default: 60000 (1 minute)');
    timeInterval = 60000;
}


var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

var connectCallback = function(err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');


        // Create a message and send it to the IoT Hub every second
        var messNum = 0;
        setInterval(function() {
            var options = {
                hostname: "demo.alleantia.com",
                path: program.AlleantiaAPIurl,
                method: "GET"
            };

            var req = http.request(options, function(res) {
                res.setEncoding('utf-8');

                var responseString = '';

                res.on('data', function(data) {
                    responseString += data;
                });

                res.on('end', function() {
                    //console.log(responseString);
                    var responseObject = JSON.parse(responseString);
                    var deviceData = new Object();
                    deviceData.description = program.DeviceDescription;
                    deviceData.dataType = program.DataType;
                    deviceData.engUnit = program.EngUnit;
                    deviceData.value = responseObject.value;
                    deviceData.timestamp = responseObject.timestamp;
                    deviceData.quality = responseObject.quality;
                    deviceData.date = new Date();
                    //deviceData.timestamp = new Date().toLocaleString();
                    //var data = JSON.stringify({ deviceId: 'firstVirtualDeviceNode', windSpeed: windSpeed });
                    var data = JSON.stringify(deviceData);
                    var message = new Message(data);
                    messNum++;
                    console.log("Sending message " + messNum + " : " + message.getData());
                    client.sendEvent(message, printResultFor('send'));

                });
            });
            req.end();


        }, timeInterval);
    }
};

client.open(connectCallback);