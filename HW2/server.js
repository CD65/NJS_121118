const express = require('express');
const app = express();

const args = process.argv.slice(2);
console.log('args', args);

const INTERVAL = args[0] || process.env.INTERVAL || 1000;
const STOP = args[1] || process.env.STOP || 5000;
const PORT = 3030;

//console.log('process.env', process.env);
console.log('INTERVAL', INTERVAL);
console.log('STOP', STOP);

let currentDate;

process.on('exit', () => console.log('Завершение программы.'));

let connectionCount = 0;

/*app.use(function (req, res, next) {
    connectionCount++;

    let TID = setInterval(() => {
        currentDate = new Date();
        console.log(currentDate, connectionCount);
    }, INTERVAL);

    let STOP_TID = setTimeout(() => {
        clearInterval(TID);
        console.log('Дата и время на момент остановки таймера (UTC): ', currentDate);
        connectionCount--;
        clearTimeout(STOP_TID);
        next();
    }, STOP);
});

app.get('/', function(req, res, next){
    res.send('Дата и время на момент остановки таймера: ' + currentDate);
    next();
}, function(req, res){
    console.log('next', connectionCount);
    if(connectionCount === 0){
        process.exit();
    }
});*/

app.get('/', function(req, res){
    connectionCount++;

    let TID = setInterval(() => {
        currentDate = new Date();
        console.log(currentDate, connectionCount);
    }, INTERVAL);

    let STOP_TID = setTimeout(() => {
        clearInterval(TID);
        console.log('Дата и время на момент остановки таймера (UTC): ', currentDate);
        connectionCount--;

        res.send('Дата и время на момент остановки таймера: ' + currentDate);
        clearTimeout(STOP_TID);

        if(connectionCount === 0){
            process.exit();
        }
    }, STOP);

});

app.listen(PORT, function(){
    console.log('Server started at localhost:' + PORT);
});