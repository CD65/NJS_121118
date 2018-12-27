const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const fs = require('fs');
const session = require('koa-session');
const config = require('./config/config.json');

const Pug = require('koa-pug');
const pug = new Pug({
  viewPath: './views',
  pretty: false,
  basedir: './views',
  noCache: true,
  app: app, // equals to pug.use(app) and app.use(pug.middleware)
});

const errorHandler = require('./libs/error');

app.use(static('./public'));

app.use(errorHandler);
app.on('error', (err, ctx) => {
  ctx.render('error', {
    status: ctx.response.status,
    error: ctx.response.message,
  });
});

const router = require('./routes');

app
  .use(session(config.session, app))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3001, () => {
  if (!fs.existsSync(config.upload)) {
    fs.mkdirSync(config.upload);
  }
});
