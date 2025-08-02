import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Secure Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Custom filename generator
 * @param {Object} file - Uploaded file
 * @returns {String} Unique public ID
 */
const generatePublicId = (file) => {
  const timestamp = Date.now();
  const originalName = file.originalname.split('.')[0];
  return `chemba-${timestamp}-${originalName}`;
};

// Optimized Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'chemba/events',
    public_id: generatePublicId(file),
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill' },
      { quality: 'auto:best' },
      { format: 'auto' }
    ]
  })
});

/**
 * File filter for image validation
 */
const validateImage = (req, file, cb) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (validMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed!'), false);
  }
};

// Configure multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10') * 1024 * 1024 // Default 10MB
  },
  fileFilter: validateImage
});

export default upload;