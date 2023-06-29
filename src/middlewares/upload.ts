const express = require('express');
const multer = require('multer');

const app = express();

// Khởi tạo middleware upload file với multer
const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      callback(null, true);
    } else {
      callback(null, false);
      return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

module.exports = upload;
