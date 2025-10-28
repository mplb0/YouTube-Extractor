const videoRoutes = require('./video');
const audioRoutes = require('./audio');
const healthRoutes = require('./health');

/**
 * Initialize all routes
 * @param {Express.Application} app - Express app instance
 */
function initializeRoutes(app) {
    app.use('/api', videoRoutes);
    app.use('/api', audioRoutes);
    app.use('/api', healthRoutes);
}

module.exports = initializeRoutes;
