const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('[CLOUDINARY] Cloudinary configured successfully.');
} else {
    console.warn('[CLOUDINARY] WARNING: Cloudinary credentials are not set or are using default placeholders in backend/.env. Uploads will fail.');
}

/**
 * Uploads a local file to Cloudinary and deletes it locally afterwards.
 * @param {string} localFilePath - Absolute or relative path to the local file
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<object>} Cloudinary upload response containing secure_url and public_id
 */
const uploadToCloudinary = async (localFilePath, folder = 'e-commerce') => {
    try {
        if (!localFilePath) {
            throw new Error('Local file path is required for Cloudinary upload.');
        }

        if (!isConfigured) {
            throw new Error('Cloudinary is not configured. Please set the environment variables in backend/.env.');
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: folder,
            resource_type: 'auto'
        });

        return result;
    } catch (error) {
        console.error('[CLOUDINARY] Upload error:', error.message || error);
        throw error;
    } finally {
        // Always delete local file after upload attempt
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlink(localFilePath, (err) => {
                if (err) {
                    console.error('[CLOUDINARY] Failed to delete local file:', localFilePath, err);
                } else {
                    console.log('[CLOUDINARY] Local file deleted successfully:', localFilePath);
                }
            });
        }
    }
};

/**
 * Extracts Cloudinary public ID from a full secure or insecure URL.
 * @param {string} url - Cloudinary asset URL
 * @returns {string|null} public ID or null if parsing fails
 */
const getPublicIdFromUrl = (url) => {
    try {
        if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
            return null;
        }
        // Split URL by '/upload/'
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        
        // Remove version number (e.g., 'v123456789/') if present
        let publicIdWithPath = parts[1];
        const versionMatch = publicIdWithPath.match(/^v\d+\//);
        if (versionMatch) {
            publicIdWithPath = publicIdWithPath.replace(/^v\d+\//, '');
        }
        
        // Remove file extension (e.g., '.jpg', '.png')
        const dotIndex = publicIdWithPath.lastIndexOf('.');
        if (dotIndex !== -1) {
            publicIdWithPath = publicIdWithPath.substring(0, dotIndex);
        }
        
        return publicIdWithPath;
    } catch (error) {
        console.error('[CLOUDINARY] Error extracting public ID from Cloudinary URL:', error);
        return null;
    }
};

/**
 * Deletes a file from Cloudinary.
 * @param {string} urlOrPublicId - Cloudinary secure URL or public ID
 * @returns {Promise<object>} Cloudinary destroy response
 */
const deleteFromCloudinary = async (urlOrPublicId) => {
    try {
        if (!urlOrPublicId) return null;
        if (!isConfigured) {
            throw new Error('Cloudinary is not configured.');
        }

        // If it's a Cloudinary URL, extract the public ID
        let publicId = urlOrPublicId;
        if (urlOrPublicId.includes('cloudinary.com')) {
            publicId = getPublicIdFromUrl(urlOrPublicId);
        }

        if (!publicId) {
            console.warn('[CLOUDINARY] Could not resolve a valid public ID for:', urlOrPublicId);
            return null;
        }

        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`[CLOUDINARY] Deleted asset: ${publicId}`, result);
        return result;
    } catch (error) {
        console.error('[CLOUDINARY] Deletion error:', error.message || error);
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    isConfigured
};
