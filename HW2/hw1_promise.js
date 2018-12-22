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

    // function findAndCopy(srcPath){
    //     fs.stat(srcPath, (er, file) => {
    //         if(file.isDirectory()){
    //             // если директория запоминаем ее
    //             detectedFolders.push(srcPath);
    //             // и вызываем findAndCopy для каждого файла внутри
    //             fs.readdir(srcPath, (er, files) => {
    //                 files.forEach(fileName => {
    //                     let filePath = [srcPath, fileName].join(sep);
    //                     findAndCopy(filePath);
    //                 });
    //             });
    //         }else{
    //             // считаем что это файл и запоминаем его
    //             detectedFiles.push(srcPath);
    //             // и делаем его копию
    //             copyFile(srcPath, destPath).then(res => {
    //                 console.log('copyFile', res);
    //                 processControl(res, detectedFiles, true);
    //             });
    //         }
    //     });
    // }

    function findAndCopy(srcPath){
        stat(srcPath).then(res => {
            if(res && typeof res === 'string'){
                // если нужно удалить файлы из источника
                if(shouldDelete){
                    deleteFile(res).then(srcPath => {
                        //console.log(srcPath, 'удален.');
                        processControl(res, detectedFiles, true);
                    });
                }else{
                    processControl(res, detectedFiles, true);
                }
            }else if(res && typeof res === 'object' && res.length) {
                res.forEach(item => {
                    let filePath = [srcPath, item].join(sep);
                    findAndCopy(filePath);
                });
            }
        });
    }

    function stat(srcPath){
        return new Promise(resolve => {
            fs.stat(srcPath, (er, file) => {
                if(file.isDirectory()){
                    // если директория запоминаем ее
                    detectedFolders.push(srcPath);
                    // и вызываем findAndCopy для каждого файла внутри
                    rd(srcPath).then(files => {
                        resolve(files);
                    });
                }else{
                    // считаем что это файл и запоминаем его
                    detectedFiles.push(srcPath);
                    // и делаем его копию
                    copyFile(srcPath, destPath).then(res => {
                        console.log('copyFile', res);
                        resolve(res);
                    });
                }
            });
        });
    }

    function rd(dir){
        return new Promise(resolve => {
            fs.readdir(dir, (er, files) => {
                resolve(files);
            });
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
                    resolve(srcStream.path);
                });
            });
        });
    }

    function deleteFile(srcPath){
        return new Promise(resolve => {
            fs.unlink(srcPath, err => {
                if(err) throw err;
                resolve(srcPath);
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

    // function removeFolders(arr){
    //     return new Promise(resolve => {
    //         let promisesArr = arr.map((curDirPath) => {
    //             removeFolder(curDirPath);
    //         });
    //         resolve(promisesArr);
    //     });
    // }

    // function removeFolder(dirPath){
    //     return new Promise(resolve => {
    //         fs.rmdir(dirPath, er => {
    //             if(er) throw er;
    //             resolve(dirPath);
    //         });
    //     });
    // }
};

main();