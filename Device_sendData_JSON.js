'use strict';

var querystring = require('querystring');
var http = require('http');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var program = require('commander');
var fs = require('fs');

var connectionString;
var timeInterval;

program
    .version('1.0')
    .option('-F, --FilePath <FilePath>', 'Specify a file path with json device condiguration.')
    .parse(process.argv);

debugger;

if (!program.FilePath) {
    console.log('Missing parameter -F. Please specify a file path for json device configuration');
    console.log('For help use  \"node SimulatedDevice_ActiveEnergyImp.js -h\"');
    process.exit(1);
}
console.log('FilePath params: ' + program.FilePath);

var params = "";
fs.readFile('./' + program.FilePath, 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }

    //console.log(data);
    params = JSON.parse(data);
    console.log(params);
    timeInterval = parseInt(params.TimeInterval, 10);
    var client = clientFromConnectionString(params.AzureConnectionString);
    client.open(function(err) {
        if (err) {
            console.log('Could not connect: ' + err);
        } else {
            console.log("Client " + params.DeviceName + " CONNECTED");
            var messNum = 0;
            var deviceDataObj = params;
            setInterval(function() {
                var options = {
                    hostname: "demo.alleantia.com",
                    path: deviceDataObj.AlleantiaAPIurl,
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
                        deviceData.description = deviceDataObj.Description;
                        deviceData.dataType = deviceDataObj.DataType;
                        deviceData.engUnit = deviceDataObj.EngUnit;
                        deviceData.value = responseObject.value;
                        deviceData.timestamp = responseObject.timestamp;
                        deviceData.quality = responseObject.quality;
                        deviceData.date = new Date();
                        //deviceData.timestamp = new Date().toLocaleString();
                        //var data = JSON.stringify({ deviceId: 'firstVirtualDeviceNode', windSpeed: windSpeed });
                        var data = JSON.stringify(deviceData);
                        var message = new Message(data);
                        messNum++;
                        var messageDetail = "[" + deviceDataObj.DeviceName + "] - Message " + messNum;
                        console.log(messageDetail + " - send data : " + message.getData());
                        client.sendEvent(message, printResultFor('send', messageDetail));

                    });
                });
                req.end();
            }, timeInterval);
        }
    });
});



function printResultFor(op, messageDetail) {
    return function printResult(err, res) {
        if (err) console.log(messageDetail + " - " + op + ' error: ' + err.toString());
        if (res) console.log(messageDetail + " - " + op + ' status: ' + res.constructor.name);
    };
}