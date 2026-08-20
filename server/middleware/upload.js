const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('../config/aws-s3');
const path = require('path');
const crypto = require('crypto');

// Helper function to generate unique filename
const generateFileName = (file) => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(file.originalname);
  return `${Date.now()}-${uniqueSuffix}${ext}`;
};

// S3 Storage for receipts
const receiptStorage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = generateFileName(file);
    cb(null, `finflow/receipts/${fileName}`);
  },
});

// S3 Storage for avatars
const avatarStorage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const fileName = generateFileName(file);
    cb(null, `finflow/avatars/${fileName}`);
  },
});

// File filter for receipts (images and PDFs)
const receiptFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'), false);
  }
};

// File filter for avatars (images only)
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
  }
};

// Multer upload configurations
const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: receiptFileFilter,
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: avatarFileFilter,
});

module.exports = { uploadReceipt, uploadAvatar };

