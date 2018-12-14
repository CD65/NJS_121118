const express = require('express');
const app = express();

app.get('/', function(req, res){
    console.log('req', req);
    //console.log('req', res);
    res.send('Hello World!');
});

app.listen(3000, function(){
    console.log('Server started at localhost:3000');
});