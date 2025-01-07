const AWS = require('aws-sdk');
const sharp = require('sharp');
const { promisify } = require('util');
const path = require('path')
const multer = require('multer');
const upload = multer()


// Initialize the S3 instance (Make sure to configure AWS SDK with your credentials)
const s3 = new AWS.S3({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region
});

const originalBucketName = process.env.bucket1;





const compresssosProfileImg = async (req, res, next) => {
  try {
    // Define the bucket names for original and compressed images
    const originalBucketName = process.env.bucket1;
    const compressedBucketName = process.env.bucket2;

    // Initialize arrays to store the original and compressed file paths
    const compressedFiles = [];
    const originalImagePaths = {};

    // Process each uploaded file
    for (let key in req.files) {
      // Iterate through each uploaded file (for each field)
      const files = req.files[key]; // files for each field
      console.log("{{{{{{{{{{{{{{", files);
      for (let file of files) {
        // Generate a unique key for the original image on S3
        const originalKey = `images/${key}_${Date.now()}${path.extname(file.originalname)}`;

        // Upload the original image to S3
        const params = {
          Bucket: originalBucketName,
          Key: originalKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        
        console.log("s3 start");
        
        const originalUploadResult = await s3.upload(params).promise();
        const originalImagePath = originalUploadResult.Key.replace('images/', '');
        
        console.log("s3end");
        
        // Store the original image path for each field
        originalImagePaths[key] = originalImagePath;

        // Process image for compression (based on MIME type)
        let outputBuffer;
        let contentType;

        // If the image is HEIC, convert it to JPEG, otherwise convert it to WebP
        if (file.mimetype === 'image/heic' || file.mimetype === 'image/HEIC') {
          outputBuffer = await sharp(file.buffer).jpeg({ quality: 50 }).toBuffer();
          contentType = 'image/jpeg';
        } else {
          outputBuffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
          contentType = 'image/webp';
        }

        // Generate a unique key for the compressed image
        const compressedKey = `${originalKey}`;

        // Upload the compressed image to S3
        const compressedParams = {
          Bucket: compressedBucketName,
          Key: compressedKey,
          Body: outputBuffer,
          ContentType: contentType,
        };

        await s3.upload(compressedParams).promise();
        compressedFiles.push(compressedKey);  // Store the compressed file key
      }
    }
    
    
    console.log("{{{{{{{{{{{{{{", compressedFiles);
    console.log("{{{{{{{{{{{{{{", originalImagePaths);
    // Attach the original image paths and compressed file paths to the request object for the next middleware/controller
    req.originalImagePaths = originalImagePaths;
    req.compressedFiles = compressedFiles;
    console.log("{{{{{{{{{{{{{{ done");
    // Move to the next middleware/controller
    next();
  } catch (error) {
    console.error('Error during file compression and upload:', error);
    next(error); // Pass the error to the next middleware for handling
  }
};





// Middleware function for compressing and uploading files to S3


// Exporting Multer upload and compress function
module.exports = { upload, compresssosProfileImg };
