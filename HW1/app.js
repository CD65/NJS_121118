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

                        // srcStream.on('close', () => {
                        //     console.log('close', srcStream.path);
                        // });
                        // srcStream.on('data', () => {
                        //     console.log('data', srcStream.path);
                        //     files.push(srcStream.path);
                        // });
                        srcStream.on('end', () => {
                            console.log('end', srcStream.path);
                        });

                        fs.mkdir(dFolder, {recursive: true}, (err) => {
                            if(err) throw err;

                            let dFilePath = [dFolder, fileName].join(pathSep);
                            let destStream = fs.createWriteStream(dFilePath);

                            srcStream.pipe(destStream);

                            destStream.on('finish', () => {
                                console.log('finish', destStream.path);
                            });
                            // destStream.on('close', () => {
                            //     console.log('close', destStream.path);
                            // });
                            // destStream.on('drain', () => {
                            //     console.log('drain', destStream.path);
                            // });
                            // destStream.on('unpipe', () => {
                            //     console.log('unpipe', destStream.path);
                            // });
                            // console.log('copy: ', srcFile.path, '=>', destFile.path);
                            // console.log('srcFile', srcFile);
                            // console.log('destFile', destFile);
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

/*main = () => {
    if(args && args.length <= 3 && args.length >= 2){
        let flag = !!(args[2] && args[2] === 'y');
        let mainDestFolder = args[1];
        // проверяем существование директории назначения
        fs.readdir(mainDestFolder, (err, files) => {
            if(err){
                // создаем ее, если она отсутствует и начинаем копирование
                if(err.code === 'ENOENT') {
                    fs.mkdir(mainDestFolder, (err) => {
                        if (err) throw err;
                        copy(args, flag);
                    });
                }else{
                    throw err;
                }
            }else{
                // или копируем сразу, если директория есть
                copy(args, flag);
            }
        });
    }else{
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
    //console.log('Копируем из \'', folders[0], '\' в \'', folders[1], '\'', flag ? ('и удаляем \' ' + folders[0] + ' \'') : '');
    let [srcPath, destPath] = folders;

    findFiles(path.join(dir, srcPath), path.join(dir, destPath), flag);
};

findFiles = (dir, dest) => {
    fs.readdir(dir, (err, files) => {
        if(err) throw err;

        files.forEach((fileName, i) => {
            let filePath = [dir, fileName].join(pathSep);

            fs.stat(filePath, (err, fileStat) => {
                if(err) throw err;

                if(fileStat.isDirectory()){
                    findFiles(filePath, dest);
                }else{
                    putFile(filePath, fileName, dest);
                }
            });
        });
    });
};

putFile = (filePath, fileName, destPath) => {
    let letter = fileName.substr(0, 1).toUpperCase();
    let destFolder = [destPath, letter].join(pathSep);
    destPath = [destPath, letter, fileName].join(pathSep);

    //console.log(filePath, ' -> ', destPath);

    let srcFile = fs.createReadStream(filePath);

    //проверяем существование директории dest/буква/
    fs.readdir(destFolder, (letterFolderErr, files) => {
        console.log('readdir:', destFolder, files, letterFolderErr ? letterFolderErr.code : '');
        if(letterFolderErr){
            if(letterFolderErr.code === 'ENOENT'){
                fs.mkdir(destFolder, (err) => {
                    if(err){
                        if(err.code === 'EEXIST'){
                            console.log('mkdir', err);
                        }
                    }
                    //save file
                    let destFile = fs.createWriteStream(destPath);
                    srcFile.pipe(destFile);
                });
            }else{
                throw letterFolderErr;
            }
        }else{
            //save file
            let destFile = fs.createWriteStream(destPath);
            srcFile.pipe(destFile);
        }
    });

    // let srcFile = fs.createReadStream(filePath);
    // let destFile = fs.createWriteStream(destPath);
    //
    // srcFile.on('error', (err) => {
    //     console.log('src err', err);
    // });
    // srcFile.on('end', (err, a) => {
    //     console.log('src end', err, a);
    // });
    //
    // destFile.on('error', (err) => {
    //     console.log('dest err', err);
    // });
    //
    // srcFile.pipe(destFile);
};*/

init();
main();