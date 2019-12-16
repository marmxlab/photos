import {BaseContext} from "koa";
import {Dirent} from "fs";
import ImageManager from "./image-manager";
import FileEntry from "./models/FileEntry";
import redis from './redis';

const fs = require('fs');

export default class File {
  static async getFileList(ctx: BaseContext, next: () => Promise<void>) {
    const { path } = ctx.query;
    const redisProcessingKey = `photos:processing:${path}`;
    const targetPath = process.env.ROOT_FOLDER + path;
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER;



    if (targetPath === thumbnailsPath) {
      ctx.status = 500;
      ctx.message = 'Thumbnail folder is not allowed to access.';
      return next();
    }

    const isProcessing = await redis.get(redisProcessingKey);
    if (!isProcessing) {
      ImageManager.generateThumbnails(path);
      redis.set(redisProcessingKey, 1, 'EX', 1800);
    }

    return fs
      .promises
      .readdir(targetPath, { withFileTypes: true })
      .then((ds: Dirent[]) =>
        ds.filter((d) => `${targetPath}${d.name}` !== thumbnailsPath)
      ) // filter out the thumbnail folder
      .then((ds: Dirent[]) =>
        ds.map((d): FileEntry => ({ n: d.name, d: d.isDirectory() }))
      )
      .then((fileEntries: FileEntry[]) => { ctx.body = fileEntries; })
      .catch((e: Error) => {
        ctx.status = 500;
        ctx.body = e.message;
      })
  }
}
