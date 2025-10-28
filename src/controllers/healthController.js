const { checkYtDlp, checkFfmpeg } = require('../utils/dependencies');

/**
 * Health check endpoint
 */
async function healthCheck(req, res) {
    const ytDlpInstalled = await checkYtDlp();
    const ffmpegInstalled = await checkFfmpeg();

    res.json({
        status: 'ok',
        ytDlp: ytDlpInstalled,
        ffmpeg: ffmpegInstalled
    });
}

module.exports = {
    healthCheck
};
