import ImageUtils from "../../../src/server/utils/image";
import FileUtils from "../../../src/server/utils/file";
import BullUtils from "../../../src/server/utils/bull";

import fs from 'fs';
import mime from 'mime-types';

jest.mock('fs');
jest.mock('mime-types');
jest.mock('../../../src/server/utils/file');
jest.mock('../../../src/server/utils/bull');

describe('ImageUtils', () => {
  describe('generateThumbnailsFor', () => {
    beforeEach(() => {
      jest.resetModules();
      FileUtils.convertRelativePathToAbsolute.mockReturnValueOnce('path/to/src');
      FileUtils.convertRelativePathToAbsolute.mockReturnValueOnce('path/to/thumbnails');
    });

    it('should make sure thumbnail folder exists', () => {
      FileUtils.mkdirIfNotExist.mockReturnValue(true); // case where thumbnail folder does not exist
      fs.promises.readdir.mockResolvedValueOnce([]);

      ImageUtils.generateThumbnailsFor('path/to/src');
      expect(FileUtils.mkdirIfNotExist).toBeCalled();
    });

    it('should create jobs to queue to generate thumbnails for supported files in the selected folder', async () => {
      const files = [
        { name: 'morning night.jpg', mimeType: 'image/jpeg' },
        { name: 'try.bmp', mimeType: 'image/bmp' },
        { name: 'wanna.png', mimeType: 'image/png' },
        { name: 'web logo.webp', mimeType: 'image/webp' },
        { name: 'iceland.heic', mimeType: 'image/heic' },
        { name: 'tame impala.mp4', mimeType: 'video/mp4' },
        { name: 'video.mpg', mimeType: 'video/mpeg' },
        { name: 'something.ogg', mimeType: 'video/ogg' },
        { name: 'hotel&casino.webm', mimeType: 'video/webm' },
        { name: 'private-video.mov', mimeType: 'video/quicktime' },
        { name: 'resume.doc', mimeType: 'application/msword' },
        { name: 'finance.xls', mimeType: 'application/vnd.ms-excel' },
      ];

      FileUtils.mkdirIfNotExist.mockReturnValue(true); // case where thumbnail folder does not exist
      fs.promises.readdir.mockResolvedValueOnce(
        files.map((file) => ({ name: file.name, isDirectory: () => false }))
      );
      files.forEach((file) => mime.lookup.mockReturnValueOnce(file.mimeType));

      await ImageUtils.generateThumbnailsFor('path/to/images');
      expect(BullUtils.addJob).toBeCalledTimes(10);
      expect(BullUtils.addJob.mock.calls[0][0]).toBe('path/to/src/morning night.jpg');
      expect(BullUtils.addJob.mock.calls[0][1]).toBe('image/jpeg');
      expect(BullUtils.addJob.mock.calls[0][2]).toBe('path/to/thumbnails');
      expect(BullUtils.addJob.mock.calls[1][0]).toBe('path/to/src/try.bmp');
      expect(BullUtils.addJob.mock.calls[1][1]).toBe('image/bmp');
      expect(BullUtils.addJob.mock.calls[2][0]).toBe('path/to/src/wanna.png');
      expect(BullUtils.addJob.mock.calls[2][1]).toBe('image/png');
      expect(BullUtils.addJob.mock.calls[3][0]).toBe('path/to/src/web logo.webp');
      expect(BullUtils.addJob.mock.calls[3][1]).toBe('image/webp');
      expect(BullUtils.addJob.mock.calls[4][0]).toBe('path/to/src/iceland.heic');
      expect(BullUtils.addJob.mock.calls[4][1]).toBe('image/heic');
      expect(BullUtils.addJob.mock.calls[5][0]).toBe('path/to/src/tame impala.mp4');
      expect(BullUtils.addJob.mock.calls[5][1]).toBe('video/mp4');
      expect(BullUtils.addJob.mock.calls[6][0]).toBe('path/to/src/video.mpg');
      expect(BullUtils.addJob.mock.calls[6][1]).toBe('video/mpeg');
      expect(BullUtils.addJob.mock.calls[7][0]).toBe('path/to/src/something.ogg');
      expect(BullUtils.addJob.mock.calls[7][1]).toBe('video/ogg');
      expect(BullUtils.addJob.mock.calls[8][0]).toBe('path/to/src/hotel&casino.webm');
      expect(BullUtils.addJob.mock.calls[8][1]).toBe('video/webm');
      expect(BullUtils.addJob.mock.calls[9][0]).toBe('path/to/src/private-video.mov');
      expect(BullUtils.addJob.mock.calls[9][1]).toBe('video/quicktime');
    });

    it('should not add job for images that already have a thumbnail', async() => {
      FileUtils.mkdirIfNotExist.mockReturnValue(false); // case where thumbnail folder exists
      fs.promises.readdir.mockResolvedValueOnce(['arctic.png.jpg']); // existing thumbnails
      fs.promises.readdir.mockResolvedValueOnce([
        { name: 'arctic.png', isDirectory: () => false },
        { name: 'monkeys.jpg', isDirectory: () => false }
      ]);
      mime.lookup.mockReturnValueOnce('image/jpeg');
      await ImageUtils.generateThumbnailsFor('path/to/images');
      expect(BullUtils.addJob).toBeCalledTimes(1);
      expect(BullUtils.addJob.mock.calls[0][0]).toBe('path/to/src/monkeys.jpg');
      expect(BullUtils.addJob.mock.calls[0][1]).toBe('image/jpeg');
    });

    it('should not call fs.readdir for loading source folder if argument `dirents` is supplied', async () => {
      await ImageUtils.generateThumbnailsFor('path/to/images', []);
      expect(fs.promises.readdir.mock.calls.length).toBe(1);
      fs.promises.readdir.mockRestore();
      FileUtils.mkdirIfNotExist.mockReturnValue(true); // case where thumbnail folder does not exist
      await ImageUtils.generateThumbnailsFor('path/to/images', []);
      expect(fs.promises.readdir.mock.calls.length).toBe(0);
    });

    it('should throw exception when any readdir tasks failed', async () => {
      fs.promises.readdir.mockRejectedValue();
      const promise = ImageUtils.generateThumbnailsFor('path/to/images');
      await expect(promise).rejects.toThrow();
    })
  });
});
