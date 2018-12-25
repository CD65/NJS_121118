const Router = require('koa-router');
const router = new Router();
const koaBody = require('koa-body');
const controllers = require('../controllers');

router.get('/', controllers.index);
router.post('/', koaBody(), controllers.feedbackForm);

router.get('/login', controllers.login);
router.post('/login', koaBody(), controllers.login);

router.get('/admin', controllers.admin);

module.exports = router;