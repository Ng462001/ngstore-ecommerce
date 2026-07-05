const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath, folder = 'e-commerce') => {
    try {
        if (!localFilePath) {
            throw new Error('Local file path is required for Cloudinary upload.');
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: folder,
            resource_type: 'auto'
        });

        return result;

    } catch (error) {
        console.error('[CLOUDINARY] Upload error:', error.message || error);
        throw error;
    } finally {
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

const getPublicIdFromUrl = (url) => {
    try {
        if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
            return null;
        }

        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        let publicIdWithPath = parts[1];
        const versionMatch = publicIdWithPath.match(/^v\d+\//);
        if (versionMatch) {
            publicIdWithPath = publicIdWithPath.replace(/^v\d+\//, '');
        }

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

const deleteFromCloudinary = async (urlOrPublicId) => {
    try {
        if (!urlOrPublicId) return null;
        let publicId = urlOrPublicId;
        if (urlOrPublicId.includes('cloudinary.com')) {
            publicId = getPublicIdFromUrl(urlOrPublicId);
        }

        if (!publicId) {
            console.warn('[CLOUDINARY] Could not resolve a valid public ID for:', urlOrPublicId);
            return null;
        }

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('[CLOUDINARY] Deletion error:', error.message || error);
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};