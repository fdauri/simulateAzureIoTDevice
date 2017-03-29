'use strict';

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var http = require('http');
var Message = require('azure-iot-device').Message;
const csvFilePath = 'DeviceData.csv';
const csv = require('csvtojson');
var fs = require('fs');

var childProcess = require('child_process');

var sensorDataArray = new Array();

var program = require('commander');

program
    .version('1.0')
    .parse(process.argv);



csv({
        noheader: false,
        trim: false,
        delimiter: ';'
    })
    .fromFile(csvFilePath)
    /*
    {   "﻿Customer":"Mesa",
        "DeviceName":"Input1Current",
        "Description":"Input 1 current",
        "DataType":"Numeric",
        "EngUnit":"A",
        "Minimum":"0",
        "Maximum":"30",
        "AzureConnectionString":"HostName=AlleantiaMesaDemoIotHub.azure-devices.net;DeviceId=Input1Current;SharedAccessKey=YLzRG5AxKIFGsXFQCW/50Mj2DaqPmMHTj6C0qqNyGm0=",
        "TimeInterval":"6000",
        "AlleantiaAPIurl":"/api/v1/devices/7/variables/1/data",
        "AlleantiaDemoHostname":"http://demo.alleantia.com",
        "StatoDevice":"Enabled",
        "InvioDati":"TRUE",
        "date":"2017-03-26T20:04:48.758Z"}
    */

.on('json', (jsonObj) => {
        var tempObj = jsonObj;
        tempObj.date = new Date();
        tempObj.id = "ship1";
        console.log(tempObj);
        sensorDataArray.push(tempObj);
    })
    .on('done', (error) => {
        console.log('End processing CSV file');
        sensorDataArray.forEach(function(element) {

            fs.writeFile('./' + element.DeviceName, JSON.stringify(element), function(err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Configuration file for device '" + element.DeviceName + "' succesfully created.");
            });


            var process = childProcess.fork('Device_sendData_JSON.js', ['-F', element.DeviceName]);
            /*
            sendData(element, function(result) {
                console.log("Callback result: " + result);
            });
            */
            /*
            // call fork process passing arguments directly in the command line
            var deviceArgs = new Array();
            deviceArgs.push('--connectionString');
            deviceArgs.push(element.AzureConnectionString);
            deviceArgs.push('--time');
            deviceArgs.push(element.TimeInterval);
            deviceArgs.push('--AlleantiaAPIurl');
            deviceArgs.push(element.AlleantiaAPIurl);
            deviceArgs.push('--DeviceDescription');
            deviceArgs.push(element.Description);
            deviceArgs.push('--DataType');
            deviceArgs.push(element.DataType);
            deviceArgs.push('--EngUnit');
            deviceArgs.push(element.EngUnit);
            console.log("ARGOMENTI PASSATI:");
            console.log("Arguments: " + deviceArgs[0]);

            var process = childProcess.execFile('node ' + __dirname + '\\Device_sendData.js', deviceArgs, function(error, stdout, stderr) {
                console.log("OUTPUT FROM EXEC");
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });
            */

            //var process = childProcess.fork("Device_sendData",deviceArgs);
        });
    })


function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

//Create an asynchronous function
function sendData(data, callback) {
    process.nextTick(function() {
        var client = clientFromConnectionString(data.AzureConnectionString);
        client.open(function(err) {
            if (err) {
                console.log('Could not connect: ' + err);
            } else {
                console.log("Client " + data.DeviceName + " CONNECTED");
                var messNum = 0;
                var deviceDataObj = data;
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
                            console.log('[' + deviceDataObj.DeviceName + '] - Sending message ' + messNum + ' : ' + message.getData());
                            client.sendEvent(message, printResultFor('send'));

                        });
                    });
                    req.end();


                }, deviceDataObj.timeInterval);
            }

        });

        callback(true);
    });
}