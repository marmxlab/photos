import axios, {AxiosPromise} from "axios";
import FileEntry from "../models/FileEntry";

export default class RestAPI {
  private static siteSecret = '';

  static getSecret() {
    return this.siteSecret;
  }

  static setSecret(secret: string) {
    this.siteSecret = secret;
  }

  static getFileList(path: string): AxiosPromise<FileEntry[]> {
    const config: any = { params: { path } };
    if (this.siteSecret) {
      config.headers = { 'X-Photos-Secret': this.siteSecret };
    }
    return axios.get('/api/list', config)
  }

  static regenerateThumbnails(path: string) {
    const config: any = { };
    if (this.siteSecret) {
      config.headers = { 'X-Photos-Secret': this.siteSecret };
    }
    return axios.post('/api/thumbnails/regenerate', { path }, config)
  }
}
