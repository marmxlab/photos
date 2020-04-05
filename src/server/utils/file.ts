import {Dirent} from "fs";
const fs = require('fs');
const path = require('path');

export default class FileUtils {
  static isAccessAllowed(aPath: string): boolean {
    // This app should only have access to the root image folder and thumbnail folder
    const allowedDirectories = [this.getRootFolderPath(), this.getThumbnailFolderPath()];
    // Below destructs the absolute file path into strings by their folder name
    const filePathSep = path.resolve(aPath).split(path.sep);

    return allowedDirectories.reduce((accumulator, dir) => {
      const allowedDirSep = path.resolve(dir).split(path.sep);
      return accumulator || allowedDirSep.reduce((sepMatched: boolean, sepFolder: string, index: number) => {
        return !sepMatched ? false : filePathSep[index] === sepFolder;
      }, true);
    }, false);
  }

  static getRootFolderPath() {
    const { ROOT_FOLDER } = process.env;
    return ROOT_FOLDER.endsWith('/') ? ROOT_FOLDER.slice(0, -1) : ROOT_FOLDER;
  }

  static getThumbnailFolderPath() {
    const { THUMBNAIL_FOLDER } = process.env;
    return THUMBNAIL_FOLDER.endsWith('/') ? THUMBNAIL_FOLDER.slice(0, -1) : THUMBNAIL_FOLDER;
  }

  static convertRelativePathToAbsolute(basePath: string, rPath: string) {
    return basePath + (rPath === '/' ? '' : rPath);
  }

  static mkdirIfNotExist(aPath: string) {
    if (!fs.existsSync(aPath)) {
      fs.mkdirSync(aPath);
    }
  }

  static getFileList(aPath: string): Promise<Dirent[]> {
    return fs
      .promises
      .readdir(aPath, { withFileTypes: true })
  }

  static deleteFilesIn(aPath: string): Promise<void> {
    return fs.promises
      .readdir(aPath, { withFileTypes: true })
      .then((ds: Dirent[]) => {
        return Promise.all(
          ds
            .filter((d) => !d.isDirectory())
            .map((d) => fs.promises.unlink(`${aPath}/${d.name}`))
        )
      })
  }
}
