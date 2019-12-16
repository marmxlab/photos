import {BaseContext} from "koa";

require('dotenv').config();

import router from './router';

const Koa = require('koa');
const app = new Koa();

const mount = require('koa-mount');
const serve = require('koa-static');


if (!process.env.ROOT_FOLDER || !process.env.THUMBNAIL_FOLDER) {
  throw new Error('ROOT_FOLDER and THUMBNAIL_FOLDER must be specified in environment variables.')
}

if(process.env.AUTH_SECRET) {
  const authSecret = process.env.AUTH_SECRET;
  app.use((ctx: BaseContext, next: () => Promise<any>) => {
    if (ctx.headers['x-photos-secret'] !== authSecret && ctx.query._secret !== authSecret) {
      ctx.status = 401;
      ctx.body = 'Unauthorized';
    } else {
      return next();
    }
  })
}

const rootPath = process.env.ROOT_FOLDER;
const thumbnailsPath = process.env.THUMBNAIL_FOLDER;

app.use(mount('/images', serve(rootPath)));
app.use(mount('/thumbnails', serve(thumbnailsPath)));
app.use(router.routes()).use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
