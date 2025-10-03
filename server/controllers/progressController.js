const Progress = require('../models/Progress');
const fs = require('fs').promises;
const path = require('path');

// Upload a new progress photo
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo file provided' });
        }

        const userId = req.user.id; // From authentication middleware

        // Get the current week number based on user's existing photos
        const existingPhotos = await Progress.find({ userId }).sort({ weekNumber: -1 });
        const weekNumber = existingPhotos.length > 0 ? existingPhotos[0].weekNumber + 1 : 1;

        // Create new progress photo record
        const progressPhoto = new Progress({
            userId,
            imageUrl: `/uploads/progress-photos/${req.file.filename}`,
            weekNumber,
            date: new Date()
        });

        await progressPhoto.save();

        res.status(201).json({
            message: 'Photo uploaded successfully',
            photo: progressPhoto
        });
    } catch (error) {
        // Clean up uploaded file if database save fails
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading photo', error: error.message });
    }
};

// Get all progress photos for the authenticated user
exports.getPhotos = async (req, res) => {
    try {
        const userId = req.user.id;
        const photos = await Progress.find({ userId }).sort({ weekNumber: 1 });

        res.status(200).json({
            message: 'Photos retrieved successfully',
            photos
        });
    } catch (error) {
        console.error('Get photos error:', error);
        res.status(500).json({ message: 'Error retrieving photos', error: error.message });
    }
};

// Get a specific photo by ID
exports.getPhotoById = async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const photo = await Progress.findOne({ _id: photoId, userId });

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        res.status(200).json({
            message: 'Photo retrieved successfully',
            photo
        });
    } catch (error) {
        console.error('Get photo error:', error);
        res.status(500).json({ message: 'Error retrieving photo', error: error.message });
    }
};

// Delete a progress photo
exports.deletePhoto = async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const photo = await Progress.findOne({ _id: photoId, userId });

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        // Delete the physical file
        const filePath = path.join(__dirname, '..', photo.imageUrl);
        try {
            await fs.unlink(filePath);
        } catch (fileError) {
            console.error('Error deleting physical file:', fileError);
            // Continue with database deletion even if file deletion fails
        }

        // Delete from database
        await Progress.deleteOne({ _id: photoId, userId });

        // Recalculate week numbers for remaining photos
        const remainingPhotos = await Progress.find({ userId }).sort({ date: 1 });

        for (let i = 0; i < remainingPhotos.length; i++) {
            remainingPhotos[i].weekNumber = i + 1;
            await remainingPhotos[i].save();
        }

        res.status(200).json({
            message: 'Photo deleted successfully',
            deletedPhotoId: photoId
        });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ message: 'Error deleting photo', error: error.message });
    }
};
