"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/* jshint esversion: 9 */
var crypto = require('crypto');
var urlModule = require('url');
var express = require('express');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var https = require('https');
var exec = require('child_process').exec;
var port = '7777';
var service = 'tba';
var tokenPath = path.join(process.env['HOME'] || process.env['USERPROFILE'], '.nstba');
var callback = "http://localhost:" + port + "/" + service;
function openBrowser(url) {
    var command = 'xdg-open';
    if (process.platform === 'darwin') {
        command = 'open';
    }
    else if (process.platform === 'win32') {
        command = 'start';
    }
    exec(command + " " + url).on('error', function (error) {
        throw error;
    });
}
var callService = function (options) {
    return new Promise(function (resolve, reject) {
        {
            var serviceUrl = urlModule.format({
                protocol: options.protocol,
                hostname: options.hostname,
                pathname: options.pathname || '',
                query: options.query || {}
            });
            var method = options.method || 'GET';
            var parseResponse = options.parseResponse !== undefined ? options.parseResponse : true;
            var output = '';
            if (options.ignoreCert) {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            }
            
            var urlObj = urlModule.parse(serviceUrl);
            urlObj.headers = options.headers;
            urlObj.method = method;
            var req = https
                .request(urlObj, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    output += chunk;
                });
                res.on('end', function () {
                    output = parseResponse ? JSON.parse(output) : output;
                    resolve(output);
                });
            })
                .on('error', function (err) {
                reject(err);
            });
            if (['GET', 'DELETE'].indexOf(method) < 0 && options.data) {
                req.write(options.data || {});
            }
            req.end(); 
            delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        }
    });
};
var OAuth1 = /** @class */ (function () {
    function OAuth1(requestConfig) {
        if (requestConfig === void 0) { requestConfig = {}; }
        this.version = '1.0';
        this.signatureMethod = 'HMAC-SHA256';
        if ((requestConfig.vm || requestConfig.molecule) &&
            (!requestConfig.key || !requestConfig.secret)) {
            throw new Error('Missing parameters --key or --secret when using -m or --vm.');
        }
        requestConfig.key =
            requestConfig.key || '446765bc51e70086cf582d32f0486fc0a764354ffec6c983b94e63af331346c4';
        requestConfig.secret =
            requestConfig.secret ||
                '97fda39654d2f0cf3f0f9011d97616f96a3136e2c7659b867e57a1e1bbbcc566';
        this._initializeConfig(requestConfig);
    }
    OAuth1.prototype.soapAuthorize = function (tokenName, requestConfig) {
        var self = this;
        return new Promise(function (resolve) {
            self.issueToken(tokenName, requestConfig).then(function (authToken) {
                if (authToken.account) {
                    authToken.account = authToken.account.replace('-', '_');
                }
                resolve(self._getSoapAuthHeader(authToken));
            });
        });
    };
    OAuth1.prototype.restAuthorize = function (tokenName, requestConfig) {
        var self = this;
        return new Promise(function (resolve) {
            self.issueToken(tokenName, requestConfig).then(function (authToken) {
                resolve(self._getRestAuthHeader(requestConfig, authToken));
            });
        });
    };
    OAuth1.getAllTokens = function () {
        return fs.existsSync(tokenPath)
            ? JSON.parse(fs.readFileSync(tokenPath).toString() || '{}')
            : {};
    };
    OAuth1.prototype._getToken = function (tokenName) {
        return OAuth1.getAllTokens()[tokenName];
    };
    OAuth1.prototype._setUrls = function () {
        var molecule = this.molecule ? "." + this.molecule : '';
        var hostName = this.vm && this.vm.replace(/https?:\/\//, '');
        var hostnameStep1 = this.vm ? hostName : "system" + molecule + ".netsuite.com";
        var hostnameStep2 = this.vm || "https://system" + molecule + ".netsuite.com";
        var hostnameStep3 = this.vm ? hostName : ".restlets.api" + molecule + ".netsuite.com";
        var step1 = hostnameStep1 + "/rest/requesttoken";
        var step2 = hostnameStep2 + "/app/login/secure/authorizetoken.nl?oauth_token=";
        var step3 = hostnameStep3 + "/rest/accesstoken";
        this.urls = { step1: step1, step2: step2, step3: step3 };
    };
    OAuth1.prototype._setConsumer = function (key, secret) {
        if (key && secret) {
            this.consumer = { key: key, secret: secret };
        }
    };
    OAuth1.prototype._saveToken = function (name, content) {
        if (content === void 0) { content = {}; }
        var tokens = OAuth1.getAllTokens();
        tokens[name] = content;
        fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), { mode: 128 });
    };
    OAuth1.prototype._startLocalServer = function () {
        var promise = new Promise(function (resolve) {
            var app = express();
            var server;
            app.use("/" + service, function (req, res) {
                res.sendFile(path.join(__dirname, 'template.html'));
                resolve(req.query);
                server.close();
            });
            server = app.listen(port, '0.0.0.0');
        });
        return promise;
    };
    OAuth1.prototype._getParameterString = function (oauthHeaders, request) {
        var url = request.url, _a = request.data, data = _a === void 0 ? {} : _a;
        var searchParams = querystring.parse(url.split('?')[1]);
        var params = this._sortObject(__assign(__assign(__assign({}, oauthHeaders), data), searchParams));
        
        var paramsString = params
            .map(function (param) {
            return param.name + "=" + param.value;
        })
            .join('&');
        return paramsString;
    };
    OAuth1.prototype._getSigningKey = function (secret) {
        if (secret === void 0) { secret = ''; }
        var signingKey = [this._encode(this.consumer.secret), this._encode(secret)].join('&');
        return signingKey;
    };
    OAuth1.prototype._getSignature = function (baseString, secret) {
        var key = this._getSigningKey(secret);
        var hash = crypto.createHmac('sha256', key);
        hash.update(baseString);
        return hash.digest('base64');
    };
    OAuth1.prototype._getRestSignature = function (oauthHeaders, request, secret) {
        var method = request.method, url = request.url;
        var baseUrl = url.split('?')[0];
        var baseString = [
            method.toUpperCase(),
            this._encode(baseUrl.toLowerCase()),
            this._encode(this._getParameterString(oauthHeaders, request))
        ].join('&');
        return this._getSignature(baseString, secret);
    };
    OAuth1.prototype._getSoapSignature = function (account, token, nonce, timestamp) {
        var baseString = [account, this.consumer.key, token.token, nonce, timestamp].join('&');
        return this._getSignature(baseString, token.secret);
    };
    OAuth1.prototype._encode = function (data) {
        return encodeURIComponent(data)
            .replace(/!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
    };
    OAuth1.prototype._sortObject = function (headers) {
        var _this = this;
        var keys = Object.keys(headers).sort();
        return keys.map(function (name) {
            return { name: _this._encode(name), value: _this._encode(headers[name]) };
        });
    };
    OAuth1.prototype._getTimestamp = function () {
        return parseInt(new Date().getTime() / 1000, 10);
    };
    OAuth1.prototype._getNonce = function () {
        return crypto.randomBytes(10).toString('hex');
    };
    OAuth1.prototype._getSoapAuthHeader = function (authToken) {
        var nonce = this._getNonce();
        var timestamp = this._getTimestamp();
        var account = authToken.account, token = authToken.token;
        var signature = this._getSoapSignature(account, authToken, nonce, timestamp);
        return {
            token: token,
            signature: signature,
            nonce: nonce,
            timestamp: timestamp,
            account: account,
            consumerKey: this.consumer.key
        };
    };
    OAuth1.prototype._getRestAuthHeader = function (request, token) {
        if (token === void 0) { token = {}; }
        var HEADER = 'OAuth';
        var oauthHeaders = {
            oauth_consumer_key: this.consumer.key,
            oauth_timestamp: this._getTimestamp(),
            oauth_nonce: this._getNonce(),
            oauth_version: this.version,
            oauth_signature_method: this.signatureMethod
        };
        if (token.token) {
            oauthHeaders.oauth_token = token.token;
        }
        if (token.callback) {
            oauthHeaders.oauth_callback = token.callback;
        }
        if (token.verifier) {
            oauthHeaders.oauth_verifier = token.verifier;
        }
        oauthHeaders.oauth_signature = this._getRestSignature(oauthHeaders, request, token.secret);
        var sortedHeaders = this._sortObject(oauthHeaders);
        var account = token.account;
        if (account) {
            sortedHeaders.push({ name: 'realm', value: account.replace('-', '_') });
        }
        var headerString = sortedHeaders
            .map(function (header) {
            return header.name + "=\"" + header.value + "\"";
        })
            .join(', ');
        return HEADER + " " + headerString;
    };
    OAuth1.prototype._baseStep = function (restMethod, params) {
        var self = this;
        return new Promise(function (resolve, reject) {
            var request = {
                protocol: 'https',
                hostname: restMethod,
                method: 'POST',
                headers: {},
                parseResponse: false
            };
            request.url = urlModule.format({
                protocol: request.protocol,
                hostname: request.hostname
            });
            request.headers.Authorization = self._getRestAuthHeader(request, params);
            callService(request).then(function (response) {
                var _a = querystring.parse(response.trim()), token = _a.oauth_token, secret = _a.oauth_token_secret;
                
                var responseJSON;
                try {
                    responseJSON = JSON.parse(response.trim());
                }
                catch (e) {
                    responseJSON = {};
                }
                if (responseJSON.error) {
                    reject(responseJSON.error.message);
                }
                resolve({ token: token, secret: secret, account: params.account });
            });
        });
    };
    OAuth1.prototype._step1 = function () {
        var self = this;
        return new Promise(function (resolve) {
            self._baseStep(self.urls.step1, { callback: callback }).then(resolve);
        });
    };
    OAuth1.prototype._step2 = function (key) {
        var promise = this._startLocalServer();
        var loginUrl = this.urls.step2 + key;
        openBrowser(loginUrl);
        return promise;
    };
    OAuth1.prototype._setVm = function (vm) {
        if (!vm) {
            return;
        }
        if (typeof vm !== 'string') {
            throw new Error('Invalid VM URL.');
        }
        this.vm = vm;
    };
    OAuth1.prototype._setMolecule = function (molecule) {
        if (!molecule) {
            return;
        }
        if (typeof molecule !== 'string') {
            throw new Error('Invalid molecule.');
        }
        this.molecule = molecule;
    };
    OAuth1.prototype._step3 = function (account, token, verifier, secret) {
        var self = this;
        return new Promise(function (resolve) {
            var params = { account: account, token: token, verifier: verifier, secret: secret };
            resolve(self._baseStep("" + (self.vm ? '' : account) + self.urls.step3, params));
        });
    };
    OAuth1.prototype.issueToken = function (tokenName, requestConfig) {
        var self = this;
        if (requestConfig === void 0) { requestConfig = {}; }
        return new Promise(function (resolve) {
            if (!tokenName) {
                throw new Error('Missing token name.');
            }
            self._initializeConfig(requestConfig);
            var authToken = self._getToken(tokenName);
            if (!authToken || !authToken.token) {
                self._step1().then(function (_a) {
                    var token = _a.token, secret = _a.secret;
                    self._step2(token).then(function (_a) {
                        var company = _a.company, oauth_token = _a.oauth_token, oauth_verifier = _a.oauth_verifier;
                        self._step3(company.replace('_', '-'), oauth_token, oauth_verifier, secret).then(function (authToken) {
                            self._saveToken(tokenName, authToken);
                            resolve(authToken);
                        });
                    });
                });
            }
            else {
                resolve(authToken);
            }
        });
    };
    OAuth1.prototype._initializeConfig = function (requestConfig) {
        this._setVm(requestConfig.vm);
        this._setMolecule(requestConfig.molecule);
        this._setUrls();
        this._setConsumer(requestConfig.key, requestConfig.secret);
    };
    return OAuth1;
}());
module.exports.OAuth1 = OAuth1;