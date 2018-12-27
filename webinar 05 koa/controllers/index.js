const db = require('../models/db');
const fs = require('fs');
const util = require('util');
const _path = require('path');
const validation = require('../libs/validation');
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const psw = require('../libs/password');

module.exports.index = async ctx => {
  ctx.render('pages/index');
};

module.exports.myWorks = async ctx => {
  const works = db.getState().works || [];
  ctx.render('pages/my-work', { items: works, auth: ctx.session.isAdmin });
};

module.exports.uploadWork = async ctx => {
  const { projectName, projectUrl, text } = ctx.request.body;
  const { name, size, path } = ctx.request.files.file;
  const valid = validation(projectName, projectUrl, text, name, size);
  if (valid) {
    await unlink(path);
    ctx.body = valid;
  }
  let fileName = _path.join(process.cwd(), 'public', 'upload', name);
  const errUpload = await rename(path, fileName);
  if (errUpload) {
    return (ctx.body = {
      mes: 'При работе с картинкой произошла ошибка на сервере',
      status: 'Error',
    });
  }
  db.get('works')
    .push({
      name: projectName,
      link: projectUrl,
      desc: text,
      picture: _path.join('upload', name),
    })
    .write();
  ctx.body = {
    mes: 'Проект успешно добавлен',
    status: 'OK',
  };
};

module.exports.contactMe = async ctx => {
  //console.log('contact-me', ctx);
  ctx.render('pages/contact-me');
};

module.exports.login = async ctx => {
  console.log('login');
  ctx.render('pages/login');
};

module.exports.auth = async ctx => {
  const { login, password } = ctx.request.body;
  console.log('auth', login, password);
  const user = db.getState().user;
  if (user.login === login && psw.validPassword(password)) {
    ctx.session.isAdmin = true;
    ctx.body = {
      mes: 'Done',
      status: 'OK',
    };
  } else {
    ctx.body = {
      mes: 'Forbiden',
      status: 'Error',
    };
  }
};
