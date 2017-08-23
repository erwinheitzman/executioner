const { gitHandler } = require('./lib/utils/SourceControlHandler');
const logger = require('./lib/Logger');

require('./lib/utils/ConfigurationHelper')
    .init()
    .then(() => {
        gitHandler.disableTestsAndPushChanges(() => {
            logger.createLogFile();
        });
    });
