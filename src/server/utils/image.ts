import {Dir, Dirent} from "fs";
import queue from "./bull";
import FileUtils from "./file";
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const SUPPORTED_MIMES = [
  'image/jpeg', 'image/bmp', 'image/png', 'image/webp', 'image/heic',
  'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 'video/quicktime'
];

export default class ImageUtils {

  static generateThumbnailsFor(rPath: string, dirents?: Dirent[]) {
    const srcFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getRootFolderPath(), rPath);
    const thumbnailFolderPath = FileUtils.convertRelativePathToAbsolute(FileUtils.getThumbnailFolderPath(), rPath);

    const tasks = [
      fs.promises.readdir(thumbnailFolderPath).catch(() => [] as string[]),
      dirents ? Promise.resolve(dirents) : fs.promises.readdir(srcFolderPath, { withFileTypes: true })
    ];

    Promise.all(tasks)
      .then(([thumbnails, ds]) => {
        return Promise.all(
          ds
            .filter((d: Dirent) => thumbnails.indexOf(`${d.name}.jpg`) === -1)
            .map((d: Dirent) => new Promise((resolve) => {
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
