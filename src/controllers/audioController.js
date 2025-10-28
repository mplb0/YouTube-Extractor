const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { checkYtDlp, checkFfmpeg, execPromise } = require('../utils/dependencies');
const { getTempDir } = require('../utils/cleanup');

const TEMP_DIR = getTempDir();

/**
 * Download full audio
 */
async function downloadAudio(req, res) {
    try {
        const { videoId } = req.body;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        // Check if yt-dlp and ffmpeg are installed
        if (!await checkYtDlp()) {
            return res.status(500).json({
                error: 'yt-dlp is not installed. Please install it first.'
            });
        }

        if (!await checkFfmpeg()) {
            return res.status(500).json({
                error: 'ffmpeg is not installed. Please install it first.'
            });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const outputPath = path.join(TEMP_DIR, `${uniqueId}.mp3`);

        // Download and extract audio
        const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;

        console.log('Extracting audio...');
        await execPromise(command);

        // Get video info for filename
        const { stdout } = await execPromise(
            `yt-dlp --get-filename -o "%(title)s.%(ext)s" "${url}"`
        );
        const baseFilename = stdout.trim().replace(/[^\w\s.-]/g, '_').replace(/\.[^/.]+$/, '');
        const filename = `${baseFilename}.mp3`;

        // Send file
        res.download(outputPath, filename, async (err) => {
            // Clean up file after download
            try {
                await fs.unlink(outputPath);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }

            if (err) {
                console.error('Error sending file:', err);
            }
        });

    } catch (error) {
        console.error('Error extracting audio:', error);
        res.status(500).json({ error: 'Failed to extract audio' });
    }
}

/**
 * Download audio segment
 */
async function downloadAudioSegment(req, res) {
    try {
        const { videoId, startTime, endTime } = req.body;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }
        if (startTime === undefined || endTime === undefined) {
            return res.status(400).json({ error: 'Start time and end time are required' });
        }

        // Check if yt-dlp and ffmpeg are installed
        if (!await checkYtDlp()) {
            return res.status(500).json({
                error: 'yt-dlp is not installed. Please install it first.'
            });
        }

        if (!await checkFfmpeg()) {
            return res.status(500).json({
                error: 'ffmpeg is not installed. Please install it first.'
            });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const tempFullPath = path.join(TEMP_DIR, `${uniqueId}_full.mp3`);
        const outputPath = path.join(TEMP_DIR, `${uniqueId}_segment.mp3`);

        // Download full audio first
        const downloadCommand = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tempFullPath}" "${url}"`;

        console.log('Extracting audio...');
        await execPromise(downloadCommand);

        // Calculate duration
        const duration = endTime - startTime;

        // Trim audio using ffmpeg
        const trimCommand = `ffmpeg -i "${tempFullPath}" -ss ${startTime} -t ${duration} -acodec copy "${outputPath}"`;

        console.log('Trimming audio segment...');
        await execPromise(trimCommand);

        // Clean up full audio file
        await fs.unlink(tempFullPath);

        // Get video info for filename
        const { stdout } = await execPromise(
            `yt-dlp --get-filename -o "%(title)s.%(ext)s" "${url}"`
        );
        const baseFilename = stdout.trim().replace(/[^\w\s.-]/g, '_').replace(/\.[^/.]+$/, '');
        const filename = `${baseFilename}_segment.mp3`;

        // Send file
        res.download(outputPath, filename, async (err) => {
            // Clean up file after download
            try {
                await fs.unlink(outputPath);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }

            if (err) {
                console.error('Error sending file:', err);
            }
        });

    } catch (error) {
        console.error('Error extracting audio segment:', error);
        res.status(500).json({ error: 'Failed to extract audio segment' });
    }
}

/**
 * Get audio for waveform
 */
async function getAudio(req, res) {
    try {
        const { videoId } = req.body;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        // Check if yt-dlp and ffmpeg are installed
        if (!await checkYtDlp()) {
            return res.status(500).json({
                error: 'yt-dlp is not installed. Please install it first.'
            });
        }

        if (!await checkFfmpeg()) {
            return res.status(500).json({
                error: 'ffmpeg is not installed. Please install it first.'
            });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const outputPath = path.join(TEMP_DIR, `${uniqueId}.mp3`);

        // Download and extract audio
        const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;

        console.log('Extracting audio for waveform...');
        await execPromise(command);

        // Send file path
        res.json({ audioPath: `/temp/${uniqueId}.mp3` });

    } catch (error) {
        console.error('Error extracting audio:', error);
        res.status(500).json({ error: 'Failed to extract audio' });
    }
}

module.exports = {
    downloadAudio,
    downloadAudioSegment,
    getAudio
};
