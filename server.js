const express = require('express');
const path = require('path');
const { ensureTempDir, cleanupOldFiles, getTempDir } = require('./src/utils/cleanup');
const { checkYtDlp, checkFfmpeg } = require('./src/utils/dependencies');
const initializeRoutes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const TEMP_DIR = getTempDir();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve temporary audio files
app.use('/temp', express.static(TEMP_DIR));

// Initialize routes
initializeRoutes(app);

// Start server
async function start() {
    await ensureTempDir();

    // Clean up old files every 10 minutes
    setInterval(cleanupOldFiles, 10 * 60 * 1000);

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running at http://localhost:${PORT}`);
        console.log(`\n📦 Dependencies check:`);

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
