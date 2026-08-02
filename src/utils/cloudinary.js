import axios from 'axios';

// Get these from env or fallback to known backend ones for ease of deployment
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demikvx8i';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'vennoirr_unsigned';

/**
 * Uploads a file directly to Cloudinary
 * @param {File} file 
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'vennoirr/products'); // optional but good for organization

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload image. Please check Cloudinary configuration.');
  }
};
