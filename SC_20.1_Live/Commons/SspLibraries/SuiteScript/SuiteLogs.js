/*
	© 2020 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('SuiteLogs', ['underscore'], function(_) {
    function getParameters(parameters) {
        return _.map(parameters, function(parameter) {
            if (nlapiImpl.nsCheckRecordObj(parameter)) {
                // record
                return '{TYPE: ' + parameter.recordType + ' ID: ' + parameter.id + '}';
            }
            const type = typeof parameter;
            return type === 'string' || type === 'number' || type === 'boolean' ? parameter : type;
        });
    }

    function processError(e) {
        let status = 500;
        let code = 'ERR_UNEXPECTED';
        let message = 'error';

        if (e instanceof nlobjError) {
            code = e.getCode();
            message = e.getDetails();
            status = badRequestError.status;
        } else if (_.isObject(e) && !_.isUndefined(e.status)) {
            status = e.status;
            code = e.code;
            message = e.message;
        } else {
            const error = nlapiCreateError(e);
            code = error.getCode();
            message = error.getDetails() !== '' ? error.getDetails() : error.getCode();
        }

        if (code === 'INSUFFICIENT_PERMISSION') {
            status = forbiddenError.status;
            code = forbiddenError.code;
            message = forbiddenError.message;
        }

        const content = {
            errorStatusCode: parseInt(status, 10).toString(),
            errorCode: code,
            errorMessage: message
        };

        if (e.errorDetails) {
            content.errorDetails = e.errorDetails;
        }

        return content;
    }

    const LOG = function(name, parameters, level, parent) {
        this.start = new Date().getTime();
        this.name = name;
        this.parameters = getParameters(parameters);
        this.level = level;
        this.ts = this.start - __sc_ssplibraries_t0;
        this.parent = parent;

        return this;
    };

    LOG.prototype.finish = function(error) {
        if (this.end) {
            return;
        }
        if (error) {
            this.error = processError(error);
        }
        this.end = new Date().getTime();
        this.duration = this.end - this.start;
    };

    LOG.prototype.toJSON = function() {
        this.finish();

        return {
            pid: 1,
            tid: 1,
            ts: this.ts * 1000,
            dur: this.duration * 1000,
            name: this.name,
            ph: 'X',
            args: {
                _ms: this.duration,
                parameters: this.parameters,
                error: this.error
            }
        };
    };

    const LOGS = [];
    let LEVEL = 0;
    let CURRENT_NODE = new LOG('ROOT', null, LEVEL);

    return {
        start: function(name, parameters) {
            CURRENT_NODE = new LOG(name, parameters, LEVEL, CURRENT_NODE);
            LOGS.push(CURRENT_NODE);
            LEVEL += 1;
        },
        end: function(error) {
            LEVEL = LEVEL === 0 ? 0 : LEVEL - 1;
            CURRENT_NODE.finish(error);
            CURRENT_NODE = CURRENT_NODE.parent ? CURRENT_NODE.parent : CURRENT_NODE;
        },
        toJSON: function() {
            return {
                TOTALTIME: new Date().getTime() - __sc_ssplibraries_t0,
                traceEvents: _.map(LOGS, function(log) {
                    return log.toJSON();
                })
            };
        }
    };
});
