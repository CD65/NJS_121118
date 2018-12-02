const fs = require('fs'),
    path = require('path'),
    dir = process.cwd(),
    //dir = './',
    readline = require('readline')
;

let rl;
let args;
let shouldDelete = false;
const pathSep = path.sep;

init = () => {
    args = process.argv.slice(2) || [];

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.on('exit', () => console.log('Завершение программы.'));
};

main = () => {
    let FA = [];
    //считываем входные данные
    if(args && args.length <= 3 && args.length >= 2){
        const [sDir, dDir, flag] = args;
        shouldDelete = flag === 'y';
        findAndCopy(sDir, dDir);
    }else{
        askFolders();
    }

    function findAndCopy(srcDir, destDir){
        //console.log('Копируем из \'', srcDir, '\' в \'', destDir, '\'', shouldDelete ? ('и удаляем \' ' + srcDir + ' \'') : '');
        fs.readdir(srcDir, (err, files) => {
            if(err) throw err;

            files.forEach((fileName) => {
                let filePath = [srcDir, fileName].join(pathSep);

                fs.stat(filePath, (err, fileStat) => {
                    if(err) throw err;

                    if(fileStat.isDirectory()){
                        findAndCopy(filePath, destDir);
                    }else{
                        let letter = fileName.substr(0, 1).toUpperCase();
                        let dFolder = [destDir, letter].join(pathSep);
                        let srcStream = fs.createReadStream(filePath);

                        FA.push(fileName);

                        fs.mkdir(dFolder, {recursive: true}, (err) => {
                            if(err) throw err;

                            let dFilePath = [dFolder, fileName].join(pathSep);
                            let destStream = fs.createWriteStream(dFilePath);

                            srcStream.pipe(destStream);

                            destStream.on('finish', () => {
                                let idx = FA.indexOf(fileName);
                                console.log('copy', srcStream.path, '=>', destStream.path);
                                if(idx !== -1){
                                    FA.splice(idx, 1);

                                    if(!FA.length){
                                        console.log('Копирование завершено.');
                                        process.exit();
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    }

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

init();
main();