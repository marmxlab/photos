import {BaseContext} from "koa";
import FileEntry from "../models/FileEntry";
import redis from '../utils/redis';
import FileUtils from "../utils/file";
import ImageUtils from "../utils/image";

export default class FileController {
  static async getFileList(ctx: BaseContext, next: () => Promise<void>) {
    const { path } = ctx.query;
    const aPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), path);
    const redisProcessingKey = `photos:processing:${path}`;

    // Check if the accessing folder is the thumbnail folder
    if (aPath === FileUtils.getThumbnailFolderPath()) {
      ctx.status = 500;
      ctx.message = 'Thumbnail folder is not allowed to access.';
      return next();
    }

    // Generate thumbnails for the accessing folder if they are not being generated
    const isProcessing = await redis.get(redisProcessingKey);
    if (!isProcessing) {
      ImageUtils.generateThumbnailsFor(path);
      await redis.set(redisProcessingKey, 1, 'EX', 1800);
    }

    try {
      const ds = await FileUtils.getFileList(aPath);
      ctx.body = ds
        .filter((d) => `${aPath}${d.name}` !== FileUtils.getThumbnailFolderPath())
        .map((d): FileEntry => ({ n: d.name, d: d.isDirectory() }))

      return next();
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
    }
  }

  static async regenerateThumbnails(ctx: any, next: () => Promise<void>) {
    const { path } = ctx.request.body;
    const aPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getThumbnailFolderPath(), path);
    const redisProcessingKey = `photos:processing:${path}`;

    // Check if accessing folder is allowed to access
    if (!FileUtils.isAccessAllowed(aPath)) {
      throw 'This directory is not allowed to access';
    }

    try {
      await redis.del(redisProcessingKey);
      await FileUtils.deleteFilesIn(aPath);
      ctx.status = 200;
      await next();

      // after responding to client
      redis.set(redisProcessingKey, 1, 'EX', 1800);
      ImageUtils.generateThumbnailsFor(aPath);
    }
    catch(e) {
      ctx.status = 500;
      ctx.body = e;
    }
  }
}
