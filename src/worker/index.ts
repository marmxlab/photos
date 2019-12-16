import {DoneCallback, Job} from "bull";

const fs = require('fs');
import jimp from "jimp";
const Bull = require('bull');
const queue = new Bull('thumbnail-generations');

queue.process(async (job: Job<{ srcPath: string, dstPath: string, overwrite? : boolean }>) => {
  const { srcPath, dstPath, overwrite } = job.data;

  if (!overwrite && fs.existsSync(dstPath)) {
    return Promise.resolve();
  }
  console.log('Generating thumbnail for', srcPath);

  return jimp
    .read(srcPath)
    .then((image) => new Promise((resolve) => {
      image.cover(500, 500, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE, (e, thumbnail) => {
        if (e) {
          throw e;
        }
        resolve(thumbnail);
      })
    }))
    .then((thumbnail: any) => thumbnail.writeAsync(dstPath) )
    .then(() => {
      console.log('Finished generating thumbnail for', srcPath)
    })
});
