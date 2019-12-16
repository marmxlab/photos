import {Dir, Dirent} from "fs";
import queue from "./queue";
const fs = require('fs');
const path = require('path');

class ImageManager {

  constructor() {
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER;
    if (!fs.existsSync(thumbnailsPath)) {
      fs.mkdirSync(thumbnailsPath);
    }
  }

  generateThumbnails(rPath: string) {
    const targetPath = process.env.ROOT_FOLDER + (rPath !== '/' ? rPath : '');
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER + (rPath !== '/' ? rPath : '');
    const imageFileFilter = (ds: Dirent[]) => ds.filter((d) => {
      const supportedExtensions = ['.bmp', '.jpg', '.jpeg', '.png', '.tiff'];
      return !d.isDirectory() && supportedExtensions.indexOf(path.extname(d.name).toLowerCase()) >= 0;
    });

    fs.promises
      .readdir(targetPath, { withFileTypes: true })
      .then(imageFileFilter)
      .then((ds: Dirent[]) => {

        return Promise.all(
          ds.map((d) => new Promise((resolve) => {
            const srcPath = `${targetPath}/${d.name}`;
            const dstPath = `${thumbnailsPath}/${d.name}`;
            resolve(queue.addJob(srcPath, dstPath));
          }))
        )
      })
      .catch((e: any) => {
        console.error('Uncaught error occurred while generating thumbnails for', targetPath, e.message || e);
      })
  }
}

export default new ImageManager();
