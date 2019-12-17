import FileEntry from "../models/FileEntry";

// References:
// https://www.encoding.com/formats/

export default class FileUtil {
  private static supportedImageFormats = ['bmp', 'jpg', 'jpeg', 'png', 'tiff'];
  private static supportedVideoFormats = ['mp4', 'm4a', 'm4v', 'f4v', 'f4a', 'm4b', 'm4r', 'f4b', 'mov', 'wmv', 'wma', 'ogg', 'avi', 'mov', 'ts', 'flv', '3gp', '3gp2', '3g2', '3gpp', '3gpp2'];

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
