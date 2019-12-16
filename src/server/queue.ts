const Bull = require('bull');

class Queue{
  private queue: any;

  constructor() {
    this.queue = new Bull('thumbnail-generations', {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
      }
    });
  }

  addJob(srcPath: string, dstPath: string) {
    return this.queue.add({ srcPath, dstPath });
  }
}

export default new Queue();
