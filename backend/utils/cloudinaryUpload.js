import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} folder - Folder name in Cloudinary
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadToCloudinary = (fileBuffer, folder = 'hardware-sanitary-products', options = {}) => {
  return new Promise((resolve, reject) => {
    // Create a readable stream from buffer
    // Store original high-quality images without transformations
    // Transformations will be applied on-the-fly when displaying
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        // Don't apply transformations on upload - store originals for maximum quality
        // Transformations will be applied dynamically when displaying
        quality: 'auto:best', // Best quality for storage
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create readable stream from buffer and pipe to upload stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload PDF/document buffer to Cloudinary
 * @param {Buffer} fileBuffer - PDF file buffer
 * @param {string} folder - Folder name in Cloudinary
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadPDFToCloudinary = (fileBuffer, folder = 'hardware-sanitary-catalogs', options = {}) => {
  return new Promise((resolve, reject) => {
    // Create a readable stream from buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'raw', // Use 'raw' for PDFs
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Create readable stream from buffer and pipe to upload stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

