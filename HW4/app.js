const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const fs = require('fs');
const session = require('koa-session');
const config = require('./config/config.json');

const router = require('./routes');

const Pug = require('koa-pug');
const pug = new Pug({
    viewPath: './source/template',
    pretty: false,
    basedir: './source/template',
    noCache: true,
    app: app, // equals to pug.use(app) and app.use(pug.middleware)
});

const PORT = process.env.PORT || 3000;
const errorHandler = require('./libs/error');

app.use(static('./public'));

app.use(errorHandler);
app.on('error', (err, ctx) => {
    ctx.render('pages/error', {
        status: ctx.response.status,
        error: ctx.response.message,
    });
});

app.use(session(config.session, app)).use(router.routes()).use(router.allowedMethods());

app.listen(PORT, function(){
    console.log(`Server started at localhost:${PORT}`);
});