const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept images for products, and images + docs for support/returns
const fileFilter = (req, file, cb) => {
    const isSupportOrReturn = file.fieldname === 'attachments' || 
                              (req.originalUrl && (req.originalUrl.includes('/api/support') || req.originalUrl.includes('/api/return-exchange')));

    if (isSupportOrReturn) {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const allowedMimeTypes = /image\/(jpeg|jpg|png|gif|webp)|application\/(pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)|text\/plain/;
        const mimetype = allowedMimeTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Allowed file types: images, PDF, DOC, DOCX, TXT'));
        }
    } else {
        // Product images only
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
