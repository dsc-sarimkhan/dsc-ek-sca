'use strict';

const rp = require('ns-request');
const _ = require('underscore');
const configs = require('../configurations').getConfigs();
const url = require('url');
const { OAuth1 } = require('oauth1');

var RequestHelper = {
    queue: [],
    count: 0,
    reslet_mode: true,
    MAX_RETRIES: 3,
    QUEUE_LENGTH: 3,

    request: function request(options, promise)
    {
        var self = this;
        var promise = new Promise(function(resolve, reject){

            var execute_promise = function execute_promise(){
                return self.doRequest(options).then(resolve, reject);
            };

            //We queue requests to lead with concurrent requests governance
            self.queue.push(execute_promise);
            self.run_queue();
        });
        return promise;
    },

    run_queue: function run_queue()
    {
        var self = this;

        while(this.count < this.QUEUE_LENGTH && self.queue.length){
            var head = _.first(self.queue);
            self.queue = _.rest(self.queue);

            self.count++;

            var callback = function(){
                self.count--;
                self.run_queue();
            };
            head().then(callback, callback);
        }
    },

    getAuthorizationHeader: async function getAuthorizationHeader(requestMethod, credentials) {
        requestMethod.url = requestMethod.path;
        const oauth = new OAuth1(credentials);
        return await oauth.restAuthorize(credentials.authID, requestMethod);
    },

    formatUrl: function formatUrl(credentials, query, suitelet)
    {
        credentials.hostname = credentials.hostname || 'rest.netsuite.com';

        var service_name = query['service_name']
            ,   script_id = configs.services[service_name].script
            ,   deploy_id = configs.services[service_name].deploy;

        var options = {
            protocol: 'https'
            ,	hostname: credentials.hostname
            ,	pathname: '/app/site/hosting/restlet.nl'
            ,	query: {
                script: script_id
                ,   deploy: deploy_id
                ,	t: Date.now()
            }
        };

        if(suitelet)
        {
            options.hostname = options.hostname.replace('rest', 'system');
            options.pathname = '/app/site/hosting/scriptlet.nl';
        }

        _.each(query || [], function(value, key)
        {
            options.query[key] = value;
        });

        return url.format(options);
    },

    doRequest: async function doRequest(options)
    {
        var self = this;
        var credentials = configs.credentials;

        if(!options.path)
        {
            options.query = options.query || {};
            options.data = options.data || {};
            options.query.method = options.method;

            var service_name = options.query.service_name || options.data.service_name;

            if(!service_name)
            {
                return Promise.reject('service_name is required');
            }

            options.query.service_name = service_name;
            options.data.service_name = service_name;
        }

        options = !options.retries ? {
            path: this.formatUrl(credentials, options.query, options.suitelet)
            ,	method: options.method
            ,	body: JSON.stringify(options.data)
            ,	timeout: options.timeout * 1000
        } : options;

        var args = require('ns-args').argv();
        if (args.proxy)
        {
            options.proxy = args.proxy;
        }

        if(self.reslet_mode)
        {
            var auth_header = await this.getAuthorizationHeader(options, credentials);

            options.headers = {
                'Accept': '*/*'
                ,	'Accept-Language': 'en-us'
                ,	'Authorization': auth_header
                ,	'Content-Type': 'application/json'
                ,   'User-Agent': credentials.user_agent
            };
        }

        return rp[options.method.toLowerCase()](options)
            .then(function(responseStr)
            {
                try {
                    const response = JSON.parse(responseStr);
                    if(
                        !response ||
                        !response.header ||
                        !response.header.status ||
                        !response.header.status.code ||
                        response.header.status.code !== 'SUCCESS'
                    )
                    {
                        var is_msg = response &&
                            response.header &&
                            response.header.status &&
                            response.header.status.message
                            ,   msg = is_msg ? response.header.status.message : 'Unexpected Error';

                        return Promise.reject(msg);
                    }
                    return response;
                } catch(err) {
                    return Promise.reject(err);
                }
            })
            .catch(function(error)
            {
                //HEADS UP! cannot use || here because options.retries could be 0
                options.retries = (_.isUndefined(options.retries) ? self.MAX_RETRIES : options.retries) - 1;
                if(options.retries > 0)
                {
                    //console.log('Retrying... ' + options.retries + ' left.');
                    return self.doRequest(options);
                }

                return Promise.reject(error);
            });
    }
};

module.exports = RequestHelper;
