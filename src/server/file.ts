import {BaseContext} from "koa";
import {Dirent} from "fs";
import ImageManager from "./image-manager";
import FileEntry from "./models/FileEntry";

const fs = require('fs');

export default class File {
  static getFileList(ctx: BaseContext, next: () => Promise<void>) {
    const { path } = ctx.query;

    // TODO: path validation
    // TODO: disallow thumbnail folder access

    const targetPath = process.env.ROOT_FOLDER + path;
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER;

    ImageManager.generateThumbnails(path);

    return fs
      .promises
      .readdir(targetPath, { withFileTypes: true })
      .then((ds: Dirent[]) =>
        ds.filter((d) => thumbnailsPath !== `${targetPath}/${d.name}`)
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
