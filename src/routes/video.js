const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Get video info
router.get('/info', videoController.getVideoInfo);

// Download video
router.post('/download-video', videoController.downloadVideo);

module.exports = router;
