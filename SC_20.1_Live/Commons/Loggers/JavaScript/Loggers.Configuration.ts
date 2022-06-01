/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Configuration"/>

import { LoggersAppender } from './Loggers.Appender';

export enum LogLevels {
    OFF = 0,
    FATAL = 100,
    ERROR = 200,
    WARN = 300,
    INFO = 400,
    DEBUG = 500,
    TRACE = 600,
    ALL = Infinity
}

export const prod: Profile = {
    name: 'Production',
    logLevel: LogLevels.INFO
};

export const dev: Profile = {
    name: 'Development',
    logLevel: LogLevels.ALL
};

export interface Profile {
    name: string;
    logLevel: LogLevels;
}

export interface ConfigurationProfile {
    profile: Profile;
    appenders: LoggersAppender[];
}

export interface Configuration {
    log?: ConfigurationProfile[];
    actions: {
        [action: string]: ConfigurationProfile[];
    };
    loggers: ConfigurationLoggers;
}

export interface ConfigurationLoggers {
    [loggers: string]: Configuration;
}
