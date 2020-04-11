'use strict';

const fs = jest.genMockFromModule('fs');

fs.promises = {
  readdir: jest.fn(),
  unlink: jest.fn()
};

module.exports = fs;
