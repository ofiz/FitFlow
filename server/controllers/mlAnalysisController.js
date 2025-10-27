/**
 * ML Analysis Controller
 * 
 * Handles communication between Node.js backend and Python ML service.
 * Provides methods to analyze progress photos using deep learning models.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://ml-service:5001';
const ML_SERVICE_TIMEOUT = 30000; // 30 seconds

/**
 * Analyze a single progress photo using ML service
 * 
 * @param {string} imagePath - Path to the image file on disk
 * @param {Object} options - Analysis options
 * @param {number} options.weight - Weight in kg (optional)
 * @param {number} options.height - Height in cm (optional)
 * @param {number} options.age - Age in years (optional)
 * @param {string} options.gender - Gender: 'male' or 'female' (optional)
 * @param {boolean} options.includeQuality - Include photo quality analysis (optional)
 * @returns {Promise<Object>} Analysis results
 */
exports.analyzePhoto = async (imagePath, options = {}) => {
    try {
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            throw new Error('Image file not found');
        }

        // Create form data with image file
        const formData = new FormData();
        formData.append('photo', fs.createReadStream(imagePath));
        
        // Add body metrics if provided
        if (options.weight) {
            formData.append('weight', options.weight.toString());
        }
        if (options.height) {
            formData.append('height', options.height.toString());
        }
        if (options.age) {
            formData.append('age', options.age.toString());
        }
        if (options.gender) {
            formData.append('gender', options.gender);
        }

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (options.includeQuality) {
            queryParams.append('include_quality', 'true');
        }

        // Send request to ML service
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/analyze?${queryParams.toString()}`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: ML_SERVICE_TIMEOUT,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'ML analysis failed');
        }

        return response.data.analysis;
    } catch (error) {
        console.error('ML Analysis Error:', error.message);
        
        // Handle specific errors
        if (error.code === 'ECONNREFUSED') {
            throw new Error('ML service is not available');
        }
        
        if (error.code === 'ETIMEDOUT') {
            throw new Error('ML analysis timed out');
        }

        throw new Error(`ML analysis failed: ${error.message}`);
    }
};

/**
 * Compare two progress photos
 * 
 * @param {string} photo1Path - Path to first photo (earlier)
 * @param {string} photo2Path - Path to second photo (later)
 * @returns {Promise<Object>} Comparison results with improvements
 */
exports.comparePhotos = async (photo1Path, photo2Path) => {
    try {
        // Check if both files exist
        if (!fs.existsSync(photo1Path) || !fs.existsSync(photo2Path)) {
            throw new Error('One or both image files not found');
        }

        // Create form data with both images
        const formData = new FormData();
        formData.append('photo1', fs.createReadStream(photo1Path));
        formData.append('photo2', fs.createReadStream(photo2Path));

        // Send request to ML service
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/compare`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: ML_SERVICE_TIMEOUT * 2, // Double timeout for comparison
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'Photo comparison failed');
        }

        return response.data.comparison;
    } catch (error) {
        console.error('Photo Comparison Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            throw new Error('ML service is not available');
        }

        throw new Error(`Photo comparison failed: ${error.message}`);
    }
};

/**
 * Batch analyze multiple photos
 * 
 * @param {Array<string>} imagePaths - Array of image file paths
 * @returns {Promise<Array>} Array of analysis results
 */
exports.batchAnalyze = async (imagePaths) => {
    try {
        if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
            throw new Error('No image paths provided');
        }

        if (imagePaths.length > 10) {
            throw new Error('Maximum 10 photos per batch');
        }

        // Create form data with multiple images
        const formData = new FormData();
        
        for (const imagePath of imagePaths) {
            if (!fs.existsSync(imagePath)) {
                console.warn(`Image not found: ${imagePath}`);
                continue;
            }
            formData.append('photos[]', fs.createReadStream(imagePath));
        }

        // Send request to ML service
        const response = await axios.post(
            `${ML_SERVICE_URL}/api/ml/batch-analyze`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()
                },
                timeout: ML_SERVICE_TIMEOUT * 3, // Triple timeout for batch
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.error || 'Batch analysis failed');
        }

        return response.data.results;
    } catch (error) {
        console.error('Batch Analysis Error:', error.message);
        throw new Error(`Batch analysis failed: ${error.message}`);
    }
};

/**
 * Check if ML service is healthy and available
 * 
 * @returns {Promise<boolean>} True if service is healthy
 */
exports.checkHealth = async () => {
    try {
        const response = await axios.get(
            `${ML_SERVICE_URL}/health`,
            { timeout: 5000 }
        );

        return response.data.status === 'healthy' && response.data.model_loaded;
    } catch (error) {
        console.error('ML Service health check failed:', error.message);
        return false;
    }
};

/**
 * Get ML service information
 * 
 * @returns {Promise<Object>} Service info
 */
exports.getServiceInfo = async () => {
    try {
        const response = await axios.get(
            `${ML_SERVICE_URL}/health`,
            { timeout: 5000 }
        );

        return response.data;
    } catch (error) {
        throw new Error('Unable to connect to ML service');
    }
};
