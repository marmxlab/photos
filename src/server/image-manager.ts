import {Dir, Dirent} from "fs";
import queue from "./queue";
const mime = require('mime-types');
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
      const supportedExtensions = ['.bmp', '.jpg', '.jpeg', '.png', '.mp4', '.webm', '.ogg'];
      const fileExtension = path.extname(d.name).toLowerCase();
      return !d.isDirectory() && supportedExtensions.indexOf(fileExtension) >= 0;
    });

    fs.promises
      .readdir(targetPath, { withFileTypes: true })
      .then(imageFileFilter)
      .then((ds: Dirent[]) => {
        return Promise.all(
          ds.map((d) => new Promise((resolve) => {
            const filePath = `${targetPath}/${d.name}`;
            const fileMIME = mime.lookup(filePath);
            resolve(queue.addJob(filePath, fileMIME, thumbnailsPath));
          }))
        )
      })
      .catch((e: any) => {
        console.error('Uncaught error occurred while generating thumbnails for', targetPath, e.message || e);
      })
  }
}

export default new ImageManager();
