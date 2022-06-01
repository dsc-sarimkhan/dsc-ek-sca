/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers"/>
/// <reference path="../../../Commons/Utilities/JavaScript/GlobalDeclarations.d.ts" />

import * as _ from 'underscore';
import {
    Profile,
    Configuration,
    ConfigurationLoggers,
    LogLevels,
    ConfigurationProfile,
    dev,
    prod
} from './Loggers.Configuration';

import { LoggersAppender } from './Loggers.Appender';

interface AppenderContext {
    appender: LoggersAppender;
    data: object;
}

interface Actions {
    [actionKey: number]: AppenderContext[];
}

interface ActionsName {
    [name: string]: number;
}

interface Configurations {
    [name: string]: Configuration;
}

interface Instances {
    [name: string]: Loggers;
}

interface errorMessage {
    [name: string]: boolean;
}

class Loggers {
    private static profile: Profile = SC.isDevelopment ? dev : prod;

    private actions: Actions = {};

    private actionsKey: number = 1;

    private config: Configuration;

    private actionsName: ActionsName = {};

    private static configurations: Configurations = {};

    private static instances: Instances = {};

    private static errorMessageOnce: errorMessage = {};

    protected constructor() {}

    private getAppenders(profiles: ConfigurationProfile[] = []): LoggersAppender[] {
        const configProfile: ConfigurationProfile = _.find(profiles, cp => {
            return cp.profile.name === Loggers.profile.name;
        });

        return (configProfile && configProfile.appenders) || [];
    }

    private log(method: string, logLevel: LogLevels, message: string) {
        if (logLevel <= Loggers.profile.logLevel) {
            const appenders: LoggersAppender[] = this.getAppenders(this.config.log);

            _.each(appenders, appender => {
                if (appender.ready()) {
                    try {
                        appender[method](message);
                    } catch (e) {
                        console.warn(e);
                    }
                }
            });
        }
    }

    info(data: any) {
        if (this.config) {
            this.log('info', LogLevels.INFO, data);
        }
    }

    error(data: any) {
        if (this.config) {
            this.log('error', LogLevels.ERROR, data);
        }
    }

    start(action: string, options: object = {}): number {
        if (this.config) {
            const actionKey = this.actionsKey++;
            const appenders: LoggersAppender[] = this.getAppenders(this.config.actions[action]);
            const actionAppenders = [];

            _.each(appenders, (appender: LoggersAppender) => {
                if (appender.ready()) {
                    try {
                        actionAppenders.push({
                            appender: appender,
                            data: appender.start(action, options)
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                }
            });

            this.actions[actionKey] = actionAppenders;
            this.actionsName[action] = actionKey;

            return actionKey;
        }
        return 0;
    }

    end(actionKey: number, options: object = {}) {
        if (this.config) {
            const appenders = this.actions[actionKey];

            _.each(appenders, appenderContext => {
                if (appenderContext.appender.ready()) {
                    try {
                        appenderContext.appender.end(appenderContext.data, options);
                    } catch (e) {
                        console.warn(e);
                    }
                }
            });

            delete this.actions[actionKey];
        }
    }

    endLast(actionName: string, options?: object) {
        if (this.config) {
            const actionKey = this.actionsName[actionName];

            this.end(actionKey, options);

            delete this.actionsName[actionName];
        }
    }

    static getLogger(name: string = 'root') {
        if (Loggers.configurations[name]) {
            if (!Loggers.instances[name]) {
                Loggers.instances[name] = new Loggers();
                Loggers.instances[name].config = Loggers.configurations[name];
            }

            return Loggers.instances[name];
        }

        if (!this.errorMessageOnce[name]) {
            this.errorMessageOnce[name] = true;
            console.error('Configuration for Logger "' + name + '" not setted');
        }

        return new Loggers();
    }

    static setConfiguration(configurationLogger: ConfigurationLoggers) {
        _.each(configurationLogger, (config: Configuration, name: string) => {
            const childLoggers = config.loggers;
            delete config.loggers;

            if (!Loggers.configurations[name]) {
                Loggers.configurations[name] = config;
            } else {
                console.error('Configuration for Logger "' + name + '" already setted');
            }

            Loggers.getLogger(name);

            _.each(childLoggers, (childConfigLoggers: Configuration) => {
                childConfigLoggers.log = childConfigLoggers.log || config.log;
                childConfigLoggers.actions = _.extend(
                    {},
                    config.actions,
                    childConfigLoggers.actions
                );
            });

            Loggers.setConfiguration(childLoggers);
        });
    }
}

export { Loggers };
