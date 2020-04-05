const Bull = require('bull');

class BullUtils{
  private queue: any;

  constructor() {
    this.queue = new Bull('thumbnail-generations', {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        password: process.env.REDIS_PASSWORD || undefined,
      }
    });
  }

  addJob(filePath: string, fileMIME: string, dstFolder: string) {
    return this.queue.add({ filePath, fileMIME, dstFolder });
  }
}

export default new BullUtils();
