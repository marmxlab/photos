import FileUtils from '../../../src/server/utils/file';

import fs from 'fs';

jest.mock('fs');

describe('FileUtils', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('isAccessAllowed', () => {
    process.env.ROOT_FOLDER = '/home/user/Pictures';
    process.env.THUMBNAIL_FOLDER = '/home/user/Pictures/.thumbnails';
    expect(FileUtils.isAccessAllowed('/home/user/Pictures')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/img.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/img 1.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/iceland trip/img 1.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails/img.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails/img 1.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails/iceland trip/img 1.jpg')).toBe(true);
    expect(FileUtils.isAccessAllowed('/home/user')).toBe(false);
    expect(FileUtils.isAccessAllowed('/home/user/img 1.jpg')).toBe(false);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/../img 2.jpg')).toBe(false);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/../../img 3.jpg')).toBe(false);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails/../../img 3.jpg')).toBe(false);
    expect(FileUtils.isAccessAllowed('/home/user/Pictures/.thumbnails/iceland trip/../../../img 3.jpg')).toBe(false);

  });

  describe('getRootFolderPath', () => {
    it('should return a path with no trailing slashes', () => {
      process.env.ROOT_FOLDER = 'path/to/somewhere/';
      let result = FileUtils.getRootFolderPath();
      expect(result).toBe('path/to/somewhere');

      process.env.ROOT_FOLDER = 'path/to/somewhere';
      result = FileUtils.getRootFolderPath();
      expect(result).toBe('path/to/somewhere')
    });
  });

  describe('getThumbnailFolderPath', () => {
    it('should return a path with no trailing slashes', () => {
      process.env.THUMBNAIL_FOLDER = 'path/to/somewhere/';
      let result = FileUtils.getThumbnailFolderPath();
      expect(result).toBe('path/to/somewhere');

      process.env.THUMBNAIL_FOLDER = 'path/to/somewhere';
      result = FileUtils.getThumbnailFolderPath();
      expect(result).toBe('path/to/somewhere')
    });
  });

  describe('convertRelativePathToAbsolute', () => {
    it('should return a path with no trailing slashes', () => {
      let result = FileUtils.convertRelativePathToAbsolute('base/path', '/');
      expect(result).toBe('base/path');
      result = FileUtils.convertRelativePathToAbsolute('base/path', '/day 1/something');
      expect(result).toBe('base/path/day 1/something');
      result = FileUtils.convertRelativePathToAbsolute('base/path', '/day 2/interesting/');
      expect(result).toBe('base/path/day 2/interesting');
    });
  });

  describe('mkdirIfNotExist', () => {
    it('should call mkdirSync only if existsSync returns false', () => {
      fs.existsSync.mockReturnValue(false);
      let result = FileUtils.mkdirIfNotExist('path');
      expect(fs.existsSync).toBeCalledWith('path');
      expect(fs.mkdirSync).toBeCalledWith('path');
      expect(result).toBe(true);

      fs.existsSync.mockClear();
      fs.mkdirSync.mockClear();

      fs.existsSync.mockReturnValue(true);
      result = FileUtils.mkdirIfNotExist('path');
      expect(fs.existsSync).toBeCalledWith('path');
      expect(fs.mkdirSync).not.toBeCalled();
      expect(result).toBe(false);
    });
  });

  describe('getFileList', () => {
    it('should return a promise from fs.promises.readdir', async () => {
      fs.promises.readdir.mockResolvedValue('some files');
      const result = await FileUtils.getFileList('path');
      expect(fs.promises.readdir).toBeCalledWith('path', { withFileTypes: true })
      expect(result).toBe('some files')
    });
  });

  describe('deleteFilesIn', () => {
    it('should call unlink for each file returned by fs.promises.readdir', async () => {
      const files = [
        { isDirectory: () => true, name: 'folder' },
        { isDirectory: () => false, name: 'pic1.jpg' },
        { isDirectory: () => false, name: 'pic2.jpg' },
        { isDirectory: () => true, name: 'folder 2' },
      ];
      fs.promises.readdir.mockResolvedValue(files)
      await FileUtils.deleteFilesIn('path/to/delete');
      expect(fs.promises.readdir).toBeCalledWith('path/to/delete', { withFileTypes: true });
      expect(fs.promises.unlink.mock.calls[0][0]).toBe('path/to/delete/pic1.jpg');
      expect(fs.promises.unlink.mock.calls[1][0]).toBe('path/to/delete/pic2.jpg');
    });
  });

});
