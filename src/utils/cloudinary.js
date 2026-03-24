/**
 * Uploads a file or Data URL directly to Cloudinary using an unsigned upload preset
 * @param {File|Blob|string} file - The file, Blob, or Data URL to upload
 * @param {Object} options - Upload options
 * @param {string} options.uploadPreset - The unsigned upload preset name
 * @param {string} options.cloudName - Your Cloudinary cloud name (default 'dlmnievol')
 * @returns {Promise<Object>} - A promise that resolves to the Cloudinary response object { url, public_id, ... }
 */
export const uploadToCloudinaryDirect = async (file, { uploadPreset, cloudName = 'dlmnievol' }) => {
    if (!uploadPreset) {
        throw new Error('Upload preset is required for direct Cloudinary upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return {
            url: data.secure_url,
            public_id: data.public_id,
            original_filename: data.original_filename,
            width: data.width,
            height: data.height,
            format: data.format,
            resource_type: data.resource_type
        };
    } catch (error) {
        console.error('Cloudinary Direct Upload Error:', error);
        throw error;
    }
};
