import {BaseContext} from "koa";
import FileEntry from "../models/FileEntry";
import FileUtils from "../utils/file";
import ImageUtils from "../utils/image";
import {Dirent} from "fs";

export default class FileController {
  static async getFileList(ctx: BaseContext, next: () => Promise<void>) {
    const { path } = ctx.query;
    const aPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), path);

    let ds: Dirent[];

    try {
      ds = await FileUtils.getFileList(aPath);
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
      return next();
    }

    // Check if the accessing folder is the thumbnail folder
    if (aPath === FileUtils.getThumbnailFolderPath()) {
      ctx.status = 500;
      ctx.message = 'Thumbnail folder is not allowed to access.';
      return next();
    }

    ImageUtils.generateThumbnailsFor(path, ds);

    ctx.body = ds
      .filter((d) => `${aPath}/${d.name}` !== FileUtils.getThumbnailFolderPath())
      .map((d): FileEntry => ({ n: d.name, d: d.isDirectory() }))

    return next();
  }

  static async regenerateThumbnails(ctx: any, next: () => Promise<void>) {
    const { path } = ctx.request.body;
    const aPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getThumbnailFolderPath(), path);

    // Check if accessing folder is allowed to access
    if (!FileUtils.isAccessAllowed(aPath)) {
      throw 'This directory is not allowed to access';
    }

    try {
      await FileUtils.deleteFilesIn(aPath);
      ctx.status = 200;
      await next();

      // after responding to client
      ImageUtils.generateThumbnailsFor(path);
    }
    catch(e) {
      ctx.status = 500;
      ctx.body = e;
    }
  }
}
