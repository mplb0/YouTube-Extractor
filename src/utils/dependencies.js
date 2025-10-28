const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

/**
 * Check if yt-dlp is installed
 * @returns {Promise<boolean>}
 */
async function checkYtDlp() {
    try {
        await execPromise('yt-dlp --version');
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if ffmpeg is installed
 * @returns {Promise<boolean>}
 */
async function checkFfmpeg() {
    try {
        await execPromise('ffmpeg -version');
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    checkYtDlp,
    checkFfmpeg,
    execPromise
};
