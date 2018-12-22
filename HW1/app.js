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

    function findAndCopy(srcPath, destPath){
        fs.stat(srcPath, (er, file) => {
            if(er) throw er;
            if(file.isDirectory()){
                // если директория запоминаем ее
                detectedFolders.push(srcPath);
                // и вызываем findAndCopy для каждого файла внутри
                fs.readdir(srcPath, (er, files) => {
                    if(er) throw er;
                    files.forEach(fileName => {
                        let filePath = [srcPath, fileName].join(sep);
                        findAndCopy(filePath, destPath);
                    });
                });
            }else{
                // считаем что это файл и запоминаем его
                detectedFiles.push(srcPath);
                // и делаем его копию
                doFileCopy(srcPath, destPath);
            }
        });
    }

    function doFileCopy(srcFile, destPath){
        let pathArr = srcFile.split(sep);
        let fileName = pathArr[pathArr.length - 1];
        let letter = fileName.substr(0, 1).toUpperCase();
        let destFolder = [destPath, letter].join(sep);
        let srcStream = fs.createReadStream(srcFile);

        // создаем директорию
        fs.mkdir(destFolder, {recursive: true}, er => {
            if(er) throw er;
            // и записываем в нее файл
            let destFilePath = [destFolder, fileName].join(sep);
            let destStream = fs.createWriteStream(destFilePath);

            srcStream.pipe(destStream);

            destStream.on('unpipe', () => {
                // если нужно удалить файлы из источника
                if(shouldDelete){
                    fs.unlink(srcStream.path, err => {
                        if(err) throw err;
                        processControl(srcFile, detectedFiles, true);
                    });
                }else{
                    processControl(srcFile, detectedFiles, true);
                }
            });
        });
    }

    function processControl(key, arr, isFile){
        let idx = arr.indexOf(key);
        if(idx !== -1){
            arr.splice(idx, 1);

            if(!arr.length){
                let word = isFile ? 'Копирование' : 'Удаление';
                console.log(word, 'завершено.');

                if(shouldDelete){
                    shouldDelete = false;
                    removeFolders(detectedFolders.reverse());
                }else{
                    process.exit();
                }
            }
        }
    }

    function removeFolders(arr){
        arr.forEach(dirPath => {
            fs.rmdir(dirPath, er => {
                if(er) throw er;
                processControl(dirPath, detectedFolders);
            });
        })
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

main();