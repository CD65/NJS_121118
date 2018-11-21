const fs = require('fs'),
    path = require('path'),
    readline = require('readline')
;

let rl;
let args;

init = () => {
    args = process.argv.slice(2);
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

};


if(args.length){
    console.log(args);
}else{
    console.log('Введите имена исходной и итоговой папок через пробел: ');
}