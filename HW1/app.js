const fs = require('fs'),
    path = require('path'),
    readline = require('readline')
;

let rl;
let args;

init = () => {
    args = process.argv.slice(2) || [];
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.on('exit', () => console.log('Завершение программы.'));

};

main = () => {
    if(args && args.length <= 3 && args.length >= 2){
        console.log(args);
    }else{
        //console.log('Неверное количество входных данных.\nОжидается ввод исходной папки, конечной папки и флага удаления исходной папки (y/n, необязательно)');
        askFolders();
    }
};

askFolders = () => {
    rl.question('Введите имена исходной и итоговой папок через пробел: ', answer => {
        if(answer !== ''){
            let folders = answer.split(' ');

            if(folders && folders.length === 2){
                askFlag(folders);
            }else{
                console.log('Неверное количество папок, повторите ввод. ');
                askFolders();
            }
        }else{
            console.log('Папки не заданы, повторите ввод. ');
            askFolders();
        }

        //rl.close();
    });
};

askFlag = (folders) => {
    rl.question('Удалить исходную папку? (y/n): ', answer => {
        if(answer === 'y'){
            copy(folders, true);
        }else if(answer === 'n'){
            copy(folders, false);
        }else{
            askFlag(folders);
        }
    });
};

copy = (folders, flag) => {
    console.log('Копируем из \'', folders[0], '\' в \'', folders[1], '\'', flag ? ('и удаляем \' ' + folders[0] + ' \'') : '');
    process.exit(0);
};

init();
main();