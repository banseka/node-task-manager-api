const multer = require('multer')

const avatar = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPG)$/)) {
      return cb(new Error('please file should be a jpg or jpeg or png'))
    }
    cb(undefined, true)
  }
})

module.exports = avatar