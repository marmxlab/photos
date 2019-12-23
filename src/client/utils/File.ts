import FileEntry from "../models/FileEntry";

// References:
// https://www.encoding.com/formats/

export default class FileUtil {
  private static supportedImageFormats = ['bmp', 'jpg', 'jpeg', 'png'];
  private static supportedVideoFormats = ['mp4', 'webm', 'ogg'];

  static isImageFile(file: FileEntry): boolean {
    const fileExt = this.getFileExt(file.n);
    return this.supportedImageFormats.indexOf(fileExt.toLowerCase()) >= 0;
  }

  static isVideoFile(file: FileEntry): boolean {
    const fileExt = this.getFileExt(file.n);
    return this.supportedVideoFormats.indexOf(fileExt.toLowerCase()) >= 0;
  }

  private static getFileExt(filename: string): string {
    // https://www.jstips.co/en/javascript/get-file-extension/
    const fileExt = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    return fileExt.toLocaleString();
  }
}
