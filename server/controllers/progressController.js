const Progress = require('../models/Progress');
const mlAnalysis = require('./mlAnalysisController');
const fs = require('fs').promises;
const path = require('path');

// Upload a new progress photo
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo file provided' });
        }

        const userId = req.user.id; // From authentication middleware

        // Create new progress photo record
        const progressPhoto = new Progress({
            userId,
            imageUrl: `/uploads/progress-photos/${req.file.filename}`,
            weight: req.body.weight ? parseFloat(req.body.weight) : null,
            height: req.body.height ? parseFloat(req.body.height) : null,
            age: req.body.age ? parseInt(req.body.age) : null,
            gender: req.body.gender || 'male',
            notes: req.body.notes || '',
            date: new Date()
        });

        // Save initial photo (without AI analysis)
        await progressPhoto.save();

        // Perform AI analysis BEFORE sending response
        const imagePath = req.file.path;
        
        try {
            // Prepare analysis options with body metrics
            const analysisOptions = {
                includeQuality: true,
                weight: progressPhoto.weight,
                height: progressPhoto.height,
                age: progressPhoto.age,
                gender: progressPhoto.gender
            };
            
            // Analyze photo with ML service
            const analysis = await mlAnalysis.analyzePhoto(imagePath, analysisOptions);

            // Update progress photo with AI analysis results
            progressPhoto.aiAnalysis = {
                bodyFatEstimate: analysis.body_fat_estimate,
                bmi: analysis.bmi,
                muscleScore: analysis.muscle_score,
                postureScore: analysis.posture_score,
                overallScore: analysis.overall_score,
                confidence: analysis.confidence,
                analysisVersion: analysis.analysis_version,
                modelType: analysis.model_type,
                analyzedAt: new Date()
            };

            // Add pose quality if available
            if (analysis.pose_quality) {
                progressPhoto.aiAnalysis.poseQuality = {
                    edgeClarity: analysis.pose_quality.edge_clarity,
                    brightness: analysis.pose_quality.brightness,
                    contrast: analysis.pose_quality.contrast,
                    qualityScore: analysis.pose_quality.quality_score
                };
            }

            // Save with AI analysis
            await progressPhoto.save();

            console.log(`AI analysis completed for photo ${progressPhoto._id}`);
            console.log('Analysis data:', JSON.stringify(progressPhoto.aiAnalysis, null, 2));
        } catch (mlError) {
            // Log ML error but don't fail the upload
            console.error('ML analysis failed (photo still uploaded):', mlError.message);
            // Photo is saved without AI analysis - will continue without it
        }

        // Send response AFTER AI analysis is complete (or failed)
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
        const photos = await Progress.find({ userId }).sort({ date: -1 }); // Sort by newest first

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

// Compare two progress photos
exports.comparePhotos = async (req, res) => {
    try {
        const { photo1Id, photo2Id } = req.body;
        const userId = req.user.id;

        if (!photo1Id || !photo2Id) {
            return res.status(400).json({ 
                message: 'Both photo1Id and photo2Id are required' 
            });
        }

        // Fetch both photos
        const photo1 = await Progress.findOne({ _id: photo1Id, userId });
        const photo2 = await Progress.findOne({ _id: photo2Id, userId });

        if (!photo1 || !photo2) {
            return res.status(404).json({ message: 'One or both photos not found' });
        }

        // Build file paths
        const photo1Path = path.join(__dirname, '..', photo1.imageUrl);
        const photo2Path = path.join(__dirname, '..', photo2.imageUrl);

        // Perform comparison using ML service
        const comparison = await mlAnalysis.comparePhotos(photo1Path, photo2Path);

        res.status(200).json({
            message: 'Photos compared successfully',
            comparison,
            photo1: {
                id: photo1._id,
                date: photo1.date,
                imageUrl: photo1.imageUrl
            },
            photo2: {
                id: photo2._id,
                date: photo2.date,
                imageUrl: photo2.imageUrl
            }
        });
    } catch (error) {
        console.error('Compare photos error:', error);
        res.status(500).json({ 
            message: 'Error comparing photos', 
            error: error.message 
        });
    }
};

// Re-analyze an existing photo
exports.reanalyzePhoto = async (req, res) => {
    try {
        const { photoId } = req.params;
        const userId = req.user.id;

        const photo = await Progress.findOne({ _id: photoId, userId });

        if (!photo) {
            return res.status(404).json({ message: 'Photo not found' });
        }

        const imagePath = path.join(__dirname, '..', photo.imageUrl);

        // Perform AI analysis
        const analysis = await mlAnalysis.analyzePhoto(imagePath, {
            includeQuality: true
        });

        // Update photo with new analysis
        photo.aiAnalysis = {
            bodyFatEstimate: analysis.body_fat_estimate,
            muscleScore: analysis.muscle_score,
            postureScore: analysis.posture_score,
            overallScore: analysis.overall_score,
            confidence: analysis.confidence,
            analysisVersion: analysis.analysis_version,
            modelType: analysis.model_type,
            analyzedAt: new Date()
        };

        if (analysis.pose_quality) {
            photo.aiAnalysis.poseQuality = {
                edgeClarity: analysis.pose_quality.edge_clarity,
                brightness: analysis.pose_quality.brightness,
                contrast: analysis.pose_quality.contrast,
                qualityScore: analysis.pose_quality.quality_score
            };
        }

        await photo.save();

        res.status(200).json({
            message: 'Photo re-analyzed successfully',
            photo
        });
    } catch (error) {
        console.error('Re-analyze error:', error);
        res.status(500).json({ 
            message: 'Error re-analyzing photo', 
            error: error.message 
        });
    }
};
