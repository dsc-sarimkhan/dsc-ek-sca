/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Configuration.SCA"/>

import { LoggersAppenderSensors } from './Loggers.Appender.Sensors';
import { LoggersAppenderElasticLogger } from '../../../Commons/Loggers/JavaScript/Loggers.Appender.ElasticLogger';
import {
    ConfigurationLoggers,
    dev,
    prod
} from '../../../Commons/Loggers/JavaScript/Loggers.Configuration';

// const dummy = LoggersAppenderDummy.getInstance();
const sensors = LoggersAppenderSensors.getInstance();
const elasticlogger = LoggersAppenderElasticLogger.getInstance();

/**
 * Generates the ConfigurationProfiles for every logging backend
 */
const actionsConfig = {
    Navigation: [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Place Order': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Add to Cart': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Save Credit Card': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Save Address': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Customer Registration': [
        { profile: prod, appenders: [sensors] },
        { profile: dev, appenders: [] }
    ],
    'Remove from Cart': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    'Request a Quote': [{ profile: prod, appenders: [sensors] }, { profile: dev, appenders: [] }],
    SUBSCRIPTIONS_LIST: [
        { profile: prod, appenders: [elasticlogger] },
        { profile: dev, appenders: [] }
    ]
};

export const configuration: ConfigurationLoggers = {
    root: {
        log: [{ profile: prod, appenders: [elasticlogger] }, { profile: dev, appenders: [] }],
        actions: actionsConfig,
        loggers: {}
    }
};
