import {Dir, Dirent} from "fs";
import queue from "./bull";
import FileUtils from "./file";
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const SUPPORTED_MIMES = [
  'image/jpeg', 'image/bmp', 'image/png', 'image/webp', 'image/heic',
  'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm'
];

export default class ImageUtils {

  static generateThumbnailsFor(rPath: string) {
    const srcFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), rPath);
    const thumbnailFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getThumbnailFolderPath(), rPath);

    fs.promises
      .readdir(srcFolderPath, { withFileTypes: true })
      .then((ds: Dirent[]) => {
        return Promise.all(
          ds.map((d) => new Promise((resolve) => {
            const fileAPath = `${srcFolderPath}/${d.name}`;
            const fileMIME = mime.lookup(fileAPath);

            if (SUPPORTED_MIMES.indexOf(fileMIME) >= 0) {
              resolve(queue.addJob(fileAPath, fileMIME, thumbnailFolderPath));
            } else {
              resolve()
            }
          }))
        )
      })
      .catch((e: any) => {
        console.error('Uncaught error occurred while generating thumbnails for', srcFolderPath, e.message || e);
      })
  }
}
