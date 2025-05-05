const { connectFirebase } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const firebase = require('firebase-admin');

// Initialize Firebase storage
const firebaseApp = connectFirebase();
const bucket = firebase.storage().bucket();

/**
 * Upload file to Firebase Storage
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder path in storage
 * @returns {Promise<String>} - Download URL of the uploaded file
 */
const uploadFileToStorage = async (file, folder = 'uploads') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a unique file name to prevent conflicts
    const fileName = `${folder}/${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;
    
    // Create a reference to the file in Firebase Storage
    const fileUpload = bucket.file(fileName);
    
    // Create a write stream and metadata
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: 'user', // You can add more metadata as needed
        }
      }
    });

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('Upload error:', error);
        reject(new Error('Unable to upload file.'));
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          
          // Get the public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          resolve(publicUrl);
        } catch (error) {
          console.error('Error making file public:', error);
          reject(new Error('File uploaded but could not be made public.'));
        }
      });

      // Write the file data to the stream
      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param {String} fileUrl - URL of the file to delete
 * @returns {Promise<Boolean>} - True if deletion was successful
 */
const deleteFileFromStorage = async (fileUrl) => {
  try {
    if (!fileUrl) return false;

    // Extract the file path from the URL
    const filePathMatch = fileUrl.match(/storage\.googleapis\.com\/.*?\/(.*)/);
    if (!filePathMatch || !filePathMatch[1]) {
      throw new Error('Invalid file URL format');
    }
    
    const filePath = decodeURIComponent(filePathMatch[1]);
    const file = bucket.file(filePath);
    
    // Check if file exists before attempting to delete
    const [exists] = await file.exists();
    if (!exists) {
      console.log('File does not exist:', filePath);
      return false;
    }
    
    await file.delete();
    console.log('File deleted successfully:', filePath);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};

module.exports = {
  uploadFileToStorage,
  deleteFileFromStorage
};