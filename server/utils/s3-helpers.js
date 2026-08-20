const { DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/aws-s3');

/**
 * Delete a file from S3
 * @param {string} fileUrl - The full S3 URL or key
 * @returns {Promise<void>}
 */
const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // Extract the key from URL if it's a full URL
    let key = fileUrl;
    if (fileUrl.includes('amazonaws.com')) {
      const url = new URL(fileUrl);
      key = decodeURIComponent(url.pathname.substring(1)); // Remove leading '/'
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`File deleted from S3: ${key}`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

/**
 * Generate a presigned URL for private file access
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} - Presigned URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Extract S3 key from full URL
 * @param {string} fileUrl - Full S3 URL
 * @returns {string|null} - S3 key or null
 */
const extractS3Key = (fileUrl) => {
  if (!fileUrl) return null;
  
  try {
    if (fileUrl.includes('amazonaws.com')) {
      const url = new URL(fileUrl);
      return decodeURIComponent(url.pathname.substring(1));
    }
    return fileUrl; // Already a key
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
};

module.exports = {
  deleteFileFromS3,
  getPresignedUrl,
  extractS3Key,
};
