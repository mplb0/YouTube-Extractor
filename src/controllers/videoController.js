const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { checkYtDlp, execPromise } = require('../utils/dependencies');
const { getTempDir } = require('../utils/cleanup');

const TEMP_DIR = getTempDir();

/**
 * Get video information
 */
async function getVideoInfo(req, res) {
    try {
        const { videoId } = req.query;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const { stdout } = await execPromise(
            `yt-dlp --dump-json --no-warnings "${url}"`
        );

        const info = JSON.parse(stdout);
        res.json({
            title: info.title,
            duration: info.duration,
            uploader: info.uploader,
            thumbnail: info.thumbnail
        });
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({ error: 'Failed to fetch video information' });
    }
}

/**
 * Download video
 */
async function downloadVideo(req, res) {
    try {
        const { videoId } = req.body;
        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        // Check if yt-dlp is installed
        if (!await checkYtDlp()) {
            return res.status(500).json({
                error: 'yt-dlp is not installed. Please install it first.'
            });
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const outputPath = path.join(TEMP_DIR, `${uniqueId}.mp4`);

        // Download video with best quality
        const command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${url}"`;

        console.log('Downloading video...');
        await execPromise(command);

        // Get video info for filename
        const { stdout } = await execPromise(
            `yt-dlp --get-filename -o "%(title)s.%(ext)s" "${url}"`
        );
        const filename = stdout.trim().replace(/[^\w\s.-]/g, '_');

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
        console.error('Error downloading video:', error);
        res.status(500).json({ error: 'Failed to download video' });
    }
}

module.exports = {
    getVideoInfo,
    downloadVideo
};
