const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const execPromise = promisify(exec);
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Temporary directory for downloads
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
}

// Clean up old files
async function cleanupOldFiles() {
    try {
        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            const stats = await fs.stat(filePath);
            if (now - stats.mtimeMs > maxAge) {
                await fs.unlink(filePath);
            }
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
}

// Check if yt-dlp is installed
async function checkYtDlp() {
    try {
        await execPromise('yt-dlp --version');
        return true;
    } catch {
        return false;
    }
}

// Check if ffmpeg is installed
async function checkFfmpeg() {
    try {
        await execPromise('ffmpeg -version');
        return true;
    } catch {
        return false;
    }
}

// Get video info
app.get('/api/info', async (req, res) => {
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
});

// Download video
app.post('/api/download-video', async (req, res) => {
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
});

// Extract and download audio
app.post('/api/download-audio', async (req, res) => {
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
});

// Extract and download audio segment (with start and end time)
app.post('/api/download-audio-segment', async (req, res) => {
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
});

// Get audio file for preview (temporary audio file)
app.post('/api/get-audio', async (req, res) => {
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
});

// Serve temporary audio files
app.use('/temp', express.static(TEMP_DIR));

// Health check
app.get('/api/health', async (req, res) => {
    const ytDlpInstalled = await checkYtDlp();
    const ffmpegInstalled = await checkFfmpeg();

    res.json({
        status: 'ok',
        ytDlp: ytDlpInstalled,
        ffmpeg: ffmpegInstalled
    });
});

// Start server
async function start() {
    await ensureTempDir();

    // Clean up old files every 10 minutes
    setInterval(cleanupOldFiles, 10 * 60 * 1000);

    app.listen(PORT, () => {
        console.log(`\nServer running at http://localhost:${PORT}`);
        console.log(`\nDependencies check:`);

        checkYtDlp().then(installed => {
            console.log(`   yt-dlp: ${installed ? '✓ installed' : '✗ not found'}`);
            if (!installed) {
                console.log('   Install with: pip install yt-dlp');
            }
        });

        checkFfmpeg().then(installed => {
            console.log(`   ffmpeg: ${installed ? '✓ installed' : '✗ not found'}`);
            if (!installed) {
                console.log('   Install with: brew install ffmpeg (macOS)');
            }
        });

        console.log(`\n💡 Open http://localhost:${PORT} in your browser\n`);
    });
}

start();
