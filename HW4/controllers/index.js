const db = require('../models/db');

module.exports.index = async ctx => {
    ctx.render('pages/index');
};

module.exports.login = async ctx => {
    console.log('first login');
    ctx.render('pages/login');
};

module.exports.auth = async ctx => {
    const {email, password} = ctx.request.body;
    console.log('auth', email, password);
    const user = db.getState().user;

    console.log('bd', user.email, '=>', email, user.email === email);

    if(user.email === email){
        //ctx.render('pages/login', {msgemail: 'Залогинено'});
        ctx.body = {
            msgemail: 'Залогинено',
            status: 'OK',
        };
    } else {
        //ctx.render('pages/login', {msgemail: 'Forbiden'});
        ctx.body = {
            msgemail: 'Forbiden',
            status: 'Error',
        };
    }
};

module.exports.admin = async ctx => {
    ctx.render('pages/admin');
};

module.exports.feedbackForm = async ctx => {
    console.log('ctx.req.body:', ctx.request.body);
    const { name, email, message } = ctx.request.body;
    db.get('feedback')
        .push({
            name: name,
            email: email,
            message: message
        })
        .write()
    ;
    console.log('msgemail', ctx.request.response);
    ctx.render('pages/index', {
        msgemail: 'Отослано'
    });
};