const express = require('express');
const app = express();

const args = process.argv.slice(2);
console.log('args', args);

const INTERVAL = args[0] || process.env.INTERVAL || 1000;
const STOP = args[1] || process.env.STOP || 5000;

//console.log('process.env', process.env);
console.log('INTERVAL', INTERVAL);
console.log('STOP', STOP);

let currentDate;

process.on('exit', () => console.log('Завершение программы.'));

app.get('/', function(req, res, next){
    //console.log('req', req.query);
    //console.log('req', res);
    res.send('Привет!<br />' +
        'GET запрос инициировал процессы на стороне сервера,<br />' +
        'примерно через ' + STOP + ' мс здесь будет ответ.<br />' +
        'Ждите...<br />');

    let TID = setInterval(() => {
        currentDate = new Date();
        console.log(currentDate);
    }, INTERVAL);

    let STOP_TID = setTimeout(() => {
        clearInterval(TID);
        console.log('Дата и время на момент остановки таймера (UTC): ', currentDate);
        next();
        clearTimeout(STOP_TID);
        process.exit();
    }, STOP);
}, function(){
    console.log('next fn', this);
    res.send('Дата и время на момент остановки таймера (UTC): ' + currentDate);
});

app.listen(3000, function(){
    console.log('Server started at localhost:3000');
});