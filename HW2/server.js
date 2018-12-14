const express = require('express');
const app = express();

app.get('/', function(req, res){
    //console.log('req', req.query);
    //console.log('req', res);
    res.send('Привет!<br />' +
        'Гет запрос инициировал процессы на стороне сервера,<br />' +
        'через некоторе время здесь будет ответ.<br />' +
        'Ждите...<br />');

    let tid = setInterval(() => {
        const currentDate = new Date();
        console.log(currentDate);
    }, 1000);
});

app.listen(3000, function(){
    console.log('Server started at localhost:3000');
});