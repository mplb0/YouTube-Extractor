const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// Download full audio
router.post('/download-audio', audioController.downloadAudio);

// Download audio segment
router.post('/download-audio-segment', audioController.downloadAudioSegment);

// Get audio for waveform
router.post('/get-audio', audioController.getAudio);

module.exports = router;
