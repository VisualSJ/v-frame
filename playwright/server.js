'use strict';

const { join } = require('path');
const Koa = require('koa');
const app = new Koa();

const serve = require('koa-static');

const tests = serve(join(__dirname, './tests'));
const bundle = serve(join(__dirname, '../bundle'));

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(tests);
app.use(bundle);

app.listen(3000);