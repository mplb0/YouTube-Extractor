const fs = require('fs').promises;
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../../temp');

/**
 * Ensure temp directory exists
 */
async function ensureTempDir() {
    try {
        await fs.access(TEMP_DIR);
    } catch {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    }
}

/**
 * Clean up old files from temp directory
 */
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

/**
 * Get temp directory path
 * @returns {string}
 */
function getTempDir() {
    return TEMP_DIR;
}

module.exports = {
    ensureTempDir,
    cleanupOldFiles,
    getTempDir
};
