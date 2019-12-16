import FileEntry from "../models/FileEntry";

export default class FileUtil {
  static isImageFile(file: FileEntry): boolean {
    const { n } = file;
    const imgExts = ['bmp', 'jpg', 'jpeg', 'png', 'tiff'];
    // https://www.jstips.co/en/javascript/get-file-extension/
    const fileExt = n.slice((n.lastIndexOf(".") - 1 >>> 0) + 2);
    return imgExts.indexOf(fileExt.toLowerCase()) >= 0;
  }
}
