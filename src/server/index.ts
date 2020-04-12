import path from 'path';
import FileUtils from "./utils/file";

require('dotenv').config();

if (!process.env.ROOT_FOLDER || !process.env.THUMBNAIL_FOLDER) {
  throw new Error('ROOT_FOLDER and THUMBNAIL_FOLDER must be specified in environment variables.')
}

if (path.resolve(process.env.ROOT_FOLDER) === path.resolve(process.env.THUMBNAIL_FOLDER)) {
  throw new Error('ROOT_FOLDER and THUMBNAIL_FOLDER cannot be the same.')
}

import Koa, {Context} from "koa";
import router from './router';
const app = new Koa();
const mount = require('koa-mount');
const serve = require('koa-static');
const range = require('koa-range');
const bodyParser = require('koa-bodyparser');

const rootPath = FileUtils.getRootFolderPath();
const thumbnailsPath = FileUtils.getThumbnailFolderPath();

FileUtils.mkdirIfNotExist(thumbnailsPath);

if(process.env.AUTH_SECRET) {
  const authSecret = process.env.AUTH_SECRET;
  const authMiddleware = (ctx: Context, next: () => Promise<any>) => {
    const protectedRoutes = ['/images', '/thumbnails', '/api'];
    const currentUrl = ctx.request.url;
    const authRequired = protectedRoutes.reduce((a, p) => a || currentUrl.startsWith(p), false);

    if (authRequired && ctx.headers['x-photos-secret'] !== authSecret && ctx.query._secret !== authSecret) {
      ctx.status = 401;
      ctx.body = 'Unauthorized';
    } else {
      return next();
    }
  };
  app.use(authMiddleware);
}

app.use(range);
app.use(bodyParser());
app.use(serve('public'));
app.use(mount('/images', serve(rootPath)));
app.use(mount('/thumbnails', serve(thumbnailsPath)));
app.use(router.routes()).use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
