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
    let destPath = 'dest';

    //считываем входные данные
    if(args && args.length <= 3 && args.length >= 2){
        const [sDir, dDir, flag] = args;
        shouldDelete = flag === 'y';
        destPath = dDir;

        findAndCopy(sDir);
    }else{
        askFolders();
    }

    function findAndCopy(srcPath){
        fs.stat(srcPath, (er, file) => {
            if(file.isDirectory()){
                // если директория запоминаем ее
                detectedFolders.push(srcPath);
                // и вызываем findAndCopy для каждого файла внутри
                fs.readdir(srcPath, (er, files) => {
                    files.forEach(fileName => {
                        let filePath = [srcPath, fileName].join(sep);
                        findAndCopy(filePath);
                    });
                });
            }else{
                // считаем что это файл и запоминаем его
                detectedFiles.push(srcPath);
                // и делаем его копию
                copyFile(srcPath, destPath).then(res => {
                    console.log('copyFile', res);
                    processControl(res, detectedFiles, true);
                });
            }
        });
    }

    function copyFile(srcFile, destPath){
        let pathArr = srcFile.split(sep);
        let fileName = pathArr[pathArr.length - 1];
        let letter = fileName.substr(0, 1).toUpperCase();
        let destFolder = [destPath, letter].join(sep);
        let srcStream = fs.createReadStream(srcFile);

        return new Promise((resolve, reject) => {
            // создаем директорию
            fs.mkdir(destFolder, {recursive: true}, er => {
                if(er) reject(er);
                // и записываем в нее файл
                let destFilePath = [destFolder, fileName].join(sep);
                let destStream = fs.createWriteStream(destFilePath);

                srcStream.pipe(destStream);

                destStream.on('close', () => {
                    // если нужно удалить файлы из источника
                    if(shouldDelete){
                        fs.unlink(srcStream.path, err => {
                            if(err) throw err;
                            resolve(srcStream.path);
                        });
                    }else{
                        resolve(srcStream.path);
                    }
                });
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