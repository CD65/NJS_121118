const db = require('../models/db');

module.exports.index = async ctx => {
    ctx.render('pages/index');
};

module.exports.login = async ctx => {
    // попытка ввести пароль
    if(ctx.request.body){
        console.log('login ctx.request.body:', ctx.request.body);
        //console.log('login ctx:', ctx);
        const {email, password} = ctx.request.body;

        const user = db.getState().user;
        console.log('bd', user.email, '=>', email);
        if(user.email === email){
            ctx.render('pages/login', {
                msgemail: 'Залогинено'
            });
        } else {
            ctx.render('pages/login', {
                msgemail: 'Ошибка'
            });
        }
        console.log('eq', user.email === email);
    }else{
        console.log('first login');
        ctx.render('pages/login');
    }

    //ctx.render('pages/login');
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