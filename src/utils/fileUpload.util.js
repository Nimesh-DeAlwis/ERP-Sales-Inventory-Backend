const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileUploadUtil {
    constructor() {
        this.uploadDir = path.join(__dirname, '../../uploads/user-photos');
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxSize = 5 * 1024 * 1024; // 5MB
        
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    // Generate unique filename
    generateFileName(originalName) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        return `${timestamp}_${randomString}${extension}`;
    }

    // Validate file
    validateFile(file) {
        const errors = [];
        
        if (!this.allowedTypes.includes(file.mimetype)) {
            errors.push(`File type ${file.mimetype} not allowed. Allowed types: ${this.allowedTypes.join(', ')}`);
        }
        
        if (file.size > this.maxSize) {
            errors.push(`File size ${file.size} bytes exceeds maximum allowed size ${this.maxSize} bytes`);
        }
        
        return errors;
    }

    // Save file to disk
    async saveFile(fileBuffer, fileName) {
        const filePath = path.join(this.uploadDir, fileName);
        
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, fileBuffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        fileName: fileName,
                        filePath: filePath,
                        relativePath: `/uploads/user-photos/${fileName}`
                    });
                }
            });
        });
    }

    // Delete file
    async deleteFile(fileName) {
        const filePath = path.join(this.uploadDir, fileName);
        
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // Resize image (you can implement with sharp library if needed)
    async resizeImage(fileBuffer, width, height) {
        // Implementation using sharp library
        // npm install sharp
        const sharp = require('sharp');
        return await sharp(fileBuffer)
            .resize(width, height, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toBuffer();
    }
}

module.exports = new FileUploadUtil();