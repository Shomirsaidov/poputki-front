/**
 * Compresses an image file or Data URL using HTML5 Canvas
 * @param {File|string} target - The image file/Blob or Data URL to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width of the resulting image (default 1200)
 * @param {number} options.maxHeight - Max height of the resulting image (default 1200)
 * @param {number} options.quality - Compression quality between 0 and 1 (default 0.7)
 * @returns {Promise<string>} - A promise that resolves to the compressed Data URL
 */
export const compressImage = (target, { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {}) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Output as JPEG for better compression of photos
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };

        img.onerror = (err) => {
            reject(new Error('Failed to load image for compression'));
        };

        // If target is a File/Blob, read it as Data URL first
        if (target instanceof Blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(target);
        } else if (typeof target === 'string') {
            img.src = target;
        } else {
            reject(new Error('Invalid compression target: must be File, Blob, or Data URL'));
        }
    });
};
