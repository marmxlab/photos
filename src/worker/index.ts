require('dotenv').config();

import {DoneCallback, Job} from "bull";
import ffmpeg from 'fluent-ffmpeg';
const fs = require('fs');
const path = require('path');
const Bull = require('bull');

const queue = new Bull('thumbnail-generations', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
  }
});

const IMAGE_MIMES = ['image/jpeg', 'image/bmp', 'image/png', 'image/webp'];
const VIDEO_MIMES = ['video/mp4', 'video/mpeg', 'video/ogg', 'video/webm'];

queue.process(async (job: Job<{ filePath: string, fileMIME: string, dstFolder: string, overwrite? : boolean }>, done: DoneCallback) => {
  const { filePath, fileMIME, dstFolder, overwrite } = job.data;
  const fileName = path.basename(filePath);
  const thumbnailPath = `${dstFolder}/${fileName}.jpeg`;

  if (!overwrite && fs.existsSync(thumbnailPath)) {
    return done();
  }

  if (IMAGE_MIMES.indexOf(fileMIME) === -1 && VIDEO_MIMES.indexOf(fileMIME) === -1) {
    console.log(`Not supported media format detected for generating thumbnails for ${filePath} (${fileMIME})`);
  }

  if (!fs.existsSync(dstFolder)) {
    fs.mkdirSync(dstFolder);
  }

  let ffmpegCommand = ffmpeg(filePath);

  if(VIDEO_MIMES.indexOf(fileMIME) >= 0) {
    ffmpegCommand
      .inputOptions([
        '-ss', '1',
      ])
      .outputOptions([
        '-f', 'image2',
        '-vframes', '1',
      ])
  }

  console.log('Start generate thumbnail for:     ', filePath);

  ffmpegCommand
    .size('500x?')
    .output(thumbnailPath)
    .on('end', function() {
      console.log('Finished generating thumbnail at: ', thumbnailPath);
      done();
    })
    .on('stderr', function(stderrLine) {
      // console.log('Stderr output: ' + stderrLine);
    })
    .on('error', function(err, stdout, stderr) {
      console.log('Cannot process video: ' + err.message);
    })
    .run();
});
