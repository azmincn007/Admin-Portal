const multer = require('multer');
const sharp = require('sharp');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const r2Client = require('../config/r2config');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadToR2 = async (buffer, fileName, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType
    });
    
    await r2Client.send(command);
    return {
      url: `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`,
      key: fileName
    };
  } catch (error) {
    throw new Error(`R2 upload failed: ${error.message}`);
  }
};

const processProfileImage = async (file) => {
  try {
    const processedBuffer = await sharp(file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 80,
        effort: 4
      })
      .toBuffer();

    return {
      processedBuffer,
      compressionInfo: {
        originalSize: (file.size / 1024).toFixed(2) + ' KB',
        finalSize: (processedBuffer.length / 1024).toFixed(2) + ' KB',
        reduction: (100 - (processedBuffer.length / file.size * 100)).toFixed(2) + '%'
      }
    };
  } catch (error) {
    throw new Error('Unable to process profile image: ' + error.message);
  }
};

const uploadProfileImage = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          // If no file is uploaded, continue without image processing
          return next();
        }

        // Check if it's an image
        if (!req.file.mimetype.startsWith('image/')) {
          return res.status(400).json({ 
            error: 'Invalid file type. Only image files are allowed.' 
          });
        }

        // Process image
        const { processedBuffer, compressionInfo } = await processProfileImage(req.file);
        
        // Changed: Use consistent naming with folder structure
        const fileName = `ProfileImages/profile-${req.user.userId}-${Date.now()}.webp`;
        
        // Upload to R2
        const r2Response = await uploadToR2(
          processedBuffer,
          fileName,
          'image/webp'
        );

        // Add upload info to request object
        req.uploadedProfileImage = {
          ...r2Response,
          originalName: req.file.originalname,
          compressionInfo
        };
        
        next();
      } catch (error) {
        res.status(500).json({ error: 'Failed to process and upload profile image' });
      }
    }
  ];
};

module.exports = uploadProfileImage;