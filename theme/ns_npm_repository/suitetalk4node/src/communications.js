// @module suitetalk @class SuiteTalk

const _ = require('underscore');
let request = require('request');
const xml2js = require('xml2js');
const tool = require('./tool');
const Queue = require('./queue');

_(tool).extend({
    _xml2jsOptions: {
        tagNameProcessors: [xml2js.processors.stripPrefix]
    },

    getQueue: function() {
        if (!this._queue) {
            this._queue = new Queue();
        }

        return this._queue;
    },

    _verifyDataCenterUrls: function() {
        const self = this;
        self.dataCentersDeferred = new Promise((resolve, reject) => {
            self.getDataCenterUrls(
                {
                    account: self.credentials.account
                },
                null,
                true
            )
                .then(response => {
                    const result = response.getDataCenterUrlsResponse[0].getDataCenterUrlsResult[0];
                    if (result.status[0].$.isSuccess !== 'true') {
                        reject(result.status[0].$);
                    } else {
                        self.dataCenterDomains = {
                            rest: result.dataCenterUrls[0].restDomain,
                            webservices: result.dataCenterUrls[0].webservicesDomain,
                            system: result.dataCenterUrls[0].systemDomain
                        };
                        resolve(self.dataCenterDomains);
                    }
                })
                .catch(function(error) {
                    reject(error);
                });
        });
        return self.dataCentersDeferred;
    },

    // @method _request perform the request for given action. The 'action' template will be executed
    // and the response is automatically transformed to json with xml2js defaults. The first time is
    // executed it verify and sets the correct datacenter domain for subsequent calls
    // @param {String} action @param {Object} payload @param {Function} cb
    // @return {Deferred} that will be rejected on http error or resolved with the response data
    _request: function(action, payload, cb = function() {}) {
        const self = this;
        const selfArgs = arguments;
        if (self.dataCenterDomains && self.dataCenterDomains.webservices) {
            return self.__request.apply(this, arguments);
        }

        let dataCenterPromise;

        // heads up ! we are always calling getDatacenterUrls operation the first time to get the correct suitetalk datacenter urls.
        // But this operation don't work in vms
        if (this.credentials.vm) {
            dataCenterPromise = Promise.resolve();
        } else {
            dataCenterPromise = self.dataCentersDeferred
                ? self.dataCentersDeferred
                : self._verifyDataCenterUrls();
        }
        return dataCenterPromise
            .then(function() {
                return self.__request.apply(self, selfArgs).then(function() {
                    return arguments[0];
                });
            })
            .catch(function(error) {
                cb(error);
            });
    },

    getDefaultWebServiceUrl: function() {
        if (this.credentials.molecule) {
            return `https://webservices.${this.credentials.molecule}.netsuite.com`;
        }
        if (this.credentials.vm) {
            return this.credentials.vm;
        }
        return 'https://webservices.netsuite.com';
    },

    // @method __request - has the same signature as _request
    // but it won't perform the data center domain verification.
    __request: async function(action, payloadPromise, cb) {
        const payload = await payloadPromise;
        const self = this;

        cb = cb || function() {};
        const datacenterDomain =
            (self.dataCenterDomains && self.dataCenterDomains.webservices) ||
            this.getDefaultWebServiceUrl();

        const args = require('yargs').argv;
        if (args.proxy) {
            request = request.defaults({ proxy: args.proxy });
        }
        return new Promise(function(resolve, reject) {
            self.getQueue().add(self, function(taskDone) {
                const req = request(
                    {
                        method: 'POST',
                        uri: `${datacenterDomain}/services/NetSuitePort_${self.nsVersion}`,
                        headers: {
                            'User-Agent': self.credentials.user_agent || 'Node-SOAP/0.0.1',
                            Accept:
                                'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
                            'Accept-Encoding': 'none',
                            'Accept-Charset': 'utf-8',
                            Connection: 'close',
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: `"${action}"`
                        }
                    },
                    function(err, response) {
                        if (err) {
                            return cb(err);
                        }

                        self.log(`Response text for action: ${action}\n${response.body}`);
                        xml2js.parseString(response.body, self._xml2jsOptions, function(
                            err,
                            result
                        ) {
                            if (err) {
                                reject(err);
                                return cb(err);
                            }
                            const soap_body = result.Envelope.Body[0];
                            if (soap_body && soap_body.Fault) {
                                reject(new Error(soap_body.Fault[0].faultstring[0]));
                                return cb(new Error(soap_body.Fault[0].faultstring[0]));
                            }
                            resolve(soap_body);
                            taskDone();

                            cb(null, soap_body, result);
                        });
                    }
                );

                self.log(`Request text for action: ${action}\n${payload}`);
                req.end(payload);
            });
        });
    }
});

module.exports = tool;
