/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/// <amd-module name="Loggers.Appender.Dummy"/>

import { LoggersAppender } from './Loggers.Appender';

export class LoggersAppenderDummy implements LoggersAppender {
    private static instance: LoggersAppenderDummy;

    protected constructor() {
        console.log('LoggersAppenderDummy - Init');
    }

    ready(): boolean {
        return true;
    }

    info(data) {
        console.info('LoggersAppenderDummy - Info', data);
    }

    error(data) {
        console.error('LoggersAppenderDummy - Error', data);
    }

    start(action: string) {
        console.log('LoggersAppenderDummy - Start', 'start ' + action);
        return { start: Date.now(), action: action };
    }

    end(startOptions, _options) {
        const time = (Date.now() - startOptions.start) / 1000;
        console.log('LoggersAppenderDummy - End', 'end ' + startOptions.action + ': ' + time);
    }

    static getInstance() {
        if (!LoggersAppenderDummy.instance) {
            LoggersAppenderDummy.instance = new LoggersAppenderDummy();
        }

        return LoggersAppenderDummy.instance;
    }
}
