import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import crypto from 'crypto';

// Secure Cloudinary configuration with validation
const configureCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration environment variables');
  }

  return cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    cdn_subdomain: true
  });
};

configureCloudinary();

/**
 * Generate secure public ID with hash prefix
 * @param {Object} file - Uploaded file
 * @returns {String} Unique public ID with hash prefix
 */
const generateSecurePublicId = (file) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString('hex');
  const originalName = file.originalname.split('.')[0].replace(/\W+/g, '_');
  return `chemba_${randomString}_${timestamp}_${originalName}`;
};

// Optimized storage configuration with multiple environments
const createStorage = () => {
  return new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const baseParams = {
        folder: `chemba/${process.env.NODE_ENV || 'development'}/waste-reports`,
        public_id: generateSecurePublicId(file),
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp', // Convert all to modern format
        quality: 'auto:best',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { fetch_format: 'auto' },
          { dpr: 'auto' }
        ]
      };

      // Additional optimizations for production
      if (process.env.NODE_ENV === 'production') {
        return {
          ...baseParams,
          transformation: [
            ...baseParams.transformation,
            { quality: 80 },
            { flags: 'lossy' }
          ]
        };
      }
      return baseParams;
    }
  });
};

/**
 * Strict file validation with size and type checks
 */
const validateFile = (req, file, cb) => {
  const validMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp'
  ]);

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5') * 1024 * 1024;

  if (!validMimeTypes.has(file.mimetype)) {
    return cb(new Error(
      `Invalid file type. Only ${[...validMimeTypes].join(', ')} are allowed`
    ), false);
  }

  if (file.size > maxSize) {
    return cb(new Error(
      `File too large. Max ${process.env.MAX_FILE_SIZE || 5}MB allowed`
    ), false);
  }

  cb(null, true);
};

// Configure multer with enhanced security
export const upload = multer({
  storage: createStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5') * 1024 * 1024,
    files: 1,
    fields: 5
  },
  fileFilter: validateFile
});

// Change this export
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'Upload Error',
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'File size too large' 
        : err.message,
      maxSize: `${process.env.MAX_FILE_SIZE || 5}MB`
    });
  } else if (err) {
    return res.status(400).json({
      error: 'Upload Failed',
      message: err.message
    });
  }
  next();
};

export const singleUpload = upload.single('image');
export const arrayUpload = upload.array('images', 5);
export const fieldsUpload = upload.fields([
  { name: 'primaryImage', maxCount: 1 },
  { name: 'secondaryImages', maxCount: 4 }
]);

export default upload;