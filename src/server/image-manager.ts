import {Dir, Dirent} from "fs";
import jimp from 'jimp';
const fs = require('fs');
const path = require('path');

class ImageManager {
  private workingPaths: string[] = [];

  constructor() {
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER;
    if (!fs.existsSync(thumbnailsPath)) {
      fs.mkdirSync(thumbnailsPath);
    }
  }

  generateThumbnails(rPath: string) {
    if (this.workingPaths.indexOf(rPath) >= 0) {
      return;
    }

    const targetPath = process.env.ROOT_FOLDER + rPath;
    const thumbnailsPath = process.env.THUMBNAIL_FOLDER + rPath;
    const imageFileFilter = (ds: Dirent[]) => ds.filter((d) => {
      const supportedExtensions = ['.bmp', '.jpg', '.jpeg', '.png', '.tiff'];
      return !d.isDirectory() && supportedExtensions.indexOf(path.extname(d.name).toLowerCase()) >= 0;
    });
    let numOfThumbnailsToGenerate = 0;
    let numOfThumbnailsGenerated = 0;

    fs.promises
      .readdir(targetPath, { withFileTypes: true })
      .then(imageFileFilter)
      .then((ds: Dirent[]) => {
        numOfThumbnailsToGenerate = ds.length;
        return Promise.all(
          ds.map((d) => new Promise((resolve) => {
            const srcPath = `${targetPath}/${d.name}`;
            const dstPath = `${thumbnailsPath}/${d.name}`;

            if (fs.existsSync(dstPath)) {
              numOfThumbnailsGenerated ++;
              resolve();
              return;
            }

            jimp
              .read(srcPath)
              .then((image) => new Promise((resolve2, reject2) => {
                image.cover(500, 500, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE, (e, thumbnail) => {
                  if (e) {
                    throw e;
                  }
                  return thumbnail
                    .writeAsync(dstPath)
                    .then(() => { resolve2() })
                    .catch(() => { reject2(); })
                })
              }))
              .then(() => {
                console.log(`Generating thumbnails for ${rPath}... (${++numOfThumbnailsGenerated}/${numOfThumbnailsToGenerate})`)
                resolve();
              })
              .catch((e) => {
                console.log(`Generating thumbnails for ${rPath}... (${++numOfThumbnailsGenerated}/${numOfThumbnailsToGenerate})`)
                // console.error('Failed to generate a thumbnail for', srcPath, e.message);
                resolve();
              })
          }))
        )
      })
      .then(() => {
        const index = this.workingPaths.indexOf(rPath);
        if (index >= 0) {
          this.workingPaths.splice(index, 1);
        }
      })
      .catch((e: any) => {
        console.error('Uncaught error occurred while generating thumbnails for', targetPath, e.message || e);
      })

    this.workingPaths.push(rPath);
  }
}

export default new ImageManager();
