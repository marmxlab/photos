const Bull = require('bull');

class Queue{
  private queue: any;

  constructor() {
    this.queue = new Bull('thumbnail-generations');
  }

  addJob(srcPath: string, dstPath: string) {
    return this.queue.add({ srcPath, dstPath });
  }
}

export default new Queue();
