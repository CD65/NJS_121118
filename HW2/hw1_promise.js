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

        ft(sDir).then(res => {
            console.log('Файлы скопированы: ', res);
        });
        // readDir(sDir, dDir).then(arr => {
        //     console.log('readDirR res', arr);
        //     Promise.all(arr).then(res => {
        //         console.log('promise.all res', res);
        //         process.exit();
        //     });
        // });
    }else{
        askFolders();
    }

    function ft(src) {
        return new Promise(resolve => {
            let arr = [];
            function findAndCopy(srcPath){
                fs.stat(srcPath, (er, file) => {
                    if(file.isDirectory()){
                        rd(srcPath).then(res => {
                            res.forEach(item => {
                                console.log('item', item);
                                findAndCopy(item);
                            });
                        });
                    }else{
                        arr.push(copyFile(srcPath, destPath));
                    }
                });
            }
            findAndCopy(src);
            resolve(arr);
        });
    }
    // function findAndCopy(srcPath){
    //     fs.stat(srcPath, (er, file) => {
    //         if(file.isDirectory()){
    //             rd(srcPath).then(res => {
    //                 res.forEach(item => {
    //                     console.log('item', item);
    //                     findAndCopy(item);
    //                 });
    //             });
    //         }else{
    //             arr.push(copyFile(srcPath, destPath));
    //         }
    //     });
    // }

    function rd(srcPath){
        return new Promise((resolve) => {
            fs.readdir(srcPath, (er, files) => {
                let arr = [];
                files.forEach(fileName => {
                    let filePath = [srcPath, fileName].join(sep);
                    arr.push(filePath);
                });
                resolve(arr);
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

    function readDir(srcPath, destPath){
        return new Promise((resolve, reject) => {
            fs.readdir(srcPath, (er, files) => {
                let arr = [];
                files.forEach(fileName => {
                    let filePath = [srcPath, fileName].join(sep);
                    arr.push(copyFile(filePath, destPath));
                });
                resolve(arr);
            });
        });
    }

    // function rd(srcPath, destPath){
    //     //return new Promise((resolve, reject) => {
    //         fs.readdir(srcPath, (er, files) => {
    //             files.forEach(fileName => {
    //                 let filePath = [srcPath, fileName].join(sep);
    //
    //                 fs.stat(filePath, (er, file) => {
    //                     if(file.isDirectory()){
    //
    //                     }else{
    //
    //                     }
    //                 });
    //             });
    //         });
    //     //});
    // }

    // const makeRequest = (index = 0) => {
    //     if (!dataArr[index]) {
    //         return Promise.resolve();
    //     }
    //     return new Promise((resolve, reject) => {
    //         ajaxRequest(dataArr[index]).then(() => makeRequest(index + 1));
    //     });
    // };
    // makeRequest();

    // function foo(srcPath, destPath) {
    //     function doo() {
    //         fs.stat(srcPath, (er, file) => {
    //             // always return a promise
    //             if (file.isDirectory()) {
    //                 return readDir(srcPath, destPath).then(doo);
    //             } else {
    //                 return Promise.resolve();
    //             }
    //         });
    //     }
    //     return doo(); // returns a promise
    // }

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