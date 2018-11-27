const fs = require('fs'),
    path = require('path'),
    dir = process.cwd(),
    //dir = './',
    readline = require('readline')
;

let rl;
let args;
let shouldDelete = false;
let pathSep = path.sep;

init = () => {
    args = process.argv.slice(2) || [];
    console.log('dir', dir);

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    process.on('exit', () => console.log('Завершение программы.'));
};

main = () => {
    if(args && args.length <= 3 && args.length >= 2){
        let flag = !!(args[2] && args[2] === 'y');
        copy(args, flag);
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
    destPath = [destPath, letter, fileName].join(pathSep);

    console.log(filePath, ' -> ', destPath);

    let srcFile = fs.createReadStream(filePath);
    let destFile = fs.createWriteStream(destPath);

    srcFile.on('error', (err) => {
        console.log('src err', err);
    });
    srcFile.on('end', (err, a) => {
        console.log('src end', err, a);
    });

    destFile.on('error', (err) => {
        console.log('dest err', err);
    });

    srcFile.pipe(destFile);
};

init();
main();