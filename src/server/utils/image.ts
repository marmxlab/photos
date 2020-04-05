import {Dir, Dirent} from "fs";
import queue from "./bull";
import FileUtils from "./file";
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

export default class ImageUtils {

  static generateThumbnailsFor(rPath: string) {
    const srcFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), rPath);
    const thumbnailFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getThumbnailFolderPath(), rPath);

    const imageFileFilter = (ds: Dirent[]) => ds.filter((d) => {
      const supportedExtensions = ['.bmp', '.jpg', '.jpeg', '.png', '.mp4', '.webm', '.ogg'];
      const fileExtension = path.extname(d.name).toLowerCase();
      return !d.isDirectory() && supportedExtensions.indexOf(fileExtension) >= 0;
    });

    fs.promises
      .readdir(srcFolderPath, { withFileTypes: true })
      .then(imageFileFilter)
      .then((ds: Dirent[]) => {
        return Promise.all(
          ds.map((d) => new Promise((resolve) => {
            const srcFilePath = `${srcFolderPath}/${d.name}`;
            const srcFileMIME = mime.lookup(srcFilePath);
            resolve(queue.addJob(srcFilePath, srcFileMIME, thumbnailFolderPath));
          }))
        )
      })
      .catch((e: any) => {
        console.error('Uncaught error occurred while generating thumbnails for', srcFolderPath, e.message || e);
      })
  }
}
