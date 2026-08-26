const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/aws-s3');

/**
 * Converts a private S3 URL or object key into a signed pre-signed URL
 * @param {string} fileUrlOrKey - e.g. "https://bucket.s3.../finflow/avatars/abc.png" or "finflow/avatars/abc.png"
 * @param {number} expiresIn - duration in seconds (default 7 days)
 * @returns {Promise<string|null>}
 */
const getPresignedUrl = async (fileUrlOrKey, expiresIn = 7 * 24 * 3600) => {
  if (!fileUrlOrKey) return null;

  // If already a presigned URL with signature parameters, return as is
  if (fileUrlOrKey.includes('X-Amz-Signature') || fileUrlOrKey.includes('X-Amz-Credential')) {
    return fileUrlOrKey;
  }

  // Extract key from full S3 URL or relative key
  let key = fileUrlOrKey;
  if (fileUrlOrKey.includes('.amazonaws.com/')) {
    key = decodeURIComponent(fileUrlOrKey.split('.amazonaws.com/')[1]);
  }

  // Only sign S3 objects for our bucket
  if (!key.startsWith('finflow/')) {
    return fileUrlOrKey;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'finfine-uploads-2026',
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating S3 presigned URL:', error.message);
    return fileUrlOrKey;
  }
};

module.exports = { getPresignedUrl };
