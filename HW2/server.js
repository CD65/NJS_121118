const express = require('express');
const app = express();

const args = process.argv.slice(2);
console.log('args', args);

const INTERVAL = args[0] || process.env.INTERVAL || 1000;
const STOP = args[1] || process.env.STOP || 5000;

console.log('INTERVAL', INTERVAL);
console.log('STOP', STOP);

let currentDate;
let i = 0; //кол-во запросов ожидающих ответ (в моменте)

process.on('exit', () => console.log('Завершение программы.'));

app.get('/', function(req, res){
    if(req.query && req.query.page){
        i++;

        // тики для вывода даты в консоль сервера
        let TID = setInterval(() => {
            currentDate = new Date();
            console.log(currentDate, i);
        }, INTERVAL);

        // таймоут для отправки даты на клиент
        let STOP_TID = setTimeout(() => {
            clearInterval(TID);
            console.log('Дата и время на момент остановки таймера (UTC): ', currentDate, --i);
            clearTimeout(STOP_TID);
            res.send('Дата и время остановки таймера: <br />' + currentDate);

            // выход из программы, если все клиенты получили даты остановки таймера
            if(i === 0){
                process.exit();
            }
        }, STOP);
    }else{
        res.send('Привет!<br />' +
            'GET запрос инициировал процессы на стороне сервера,<br />' +
            'примерно через ' + STOP + ' мс здесь будет ответ.<br />' +
            'Ждите...<br />' +
            '<script>window.location = window.location.origin + "?page=result_await"</script>');
    }
});

app.listen(3000, function(){
    console.log('Server started at localhost:3000');
});