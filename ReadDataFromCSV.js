const csvFilePath = 'fileCSV_path.csv';
const csv = require('csvtojson');

var sensorData = new Array();

csv({
        noheader: false,
        trim: false,
        delimiter: ';'
    })
    .fromFile(csvFilePath)
    .on('json', (jsonObj) => {
        var tempObj = jsonObj;
        tempObj.date = new Date();
        tempObj.id = "ship1";
        tempObj1 = JSON.stringify(tempObj);
        console.log(tempObj1);
        sensorData.push(tempObj);
    })
    .on('done', (error) => {
        console.log('end');
    })