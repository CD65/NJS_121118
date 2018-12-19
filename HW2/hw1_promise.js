const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sep = path.sep;
const args = process.argv.slice(2) || [];

let shouldDelete = false;
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

process.on('exit', () => console.log('Завершение программы.'));

main = () => {
    let detectedFiles = [];
    let detectedFolders = [];

    //считываем входные данные
    if(args && args.length <= 3 && args.length >= 2){
        const [sDir, dDir, flag] = args;
        shouldDelete = flag === 'y';

        findAndCopy(sDir, dDir);
    }else{
        askFolders();
    }

    const findAndCopy = async (srcPath, destPath) => {
        try{

        }catch(e){

        }
    };

    function askFolders(){
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
        });
    }

    function askFlag(folders){
        rl.question('Удалить исходную папку? (y/n): ', answer => {
            if(answer === 'y' || answer === 'n'){
                shouldDelete = answer === 'y';
                findAndCopy(folders[0], folders[1]);
            }else{
                askFlag(folders);
            }
        });
    }
};

main();