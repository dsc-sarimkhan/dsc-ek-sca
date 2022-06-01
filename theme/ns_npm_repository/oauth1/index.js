/* jshint esversion: 9 */
const crypto = require('crypto');
const urlModule = require('url');
const os = require('os');
const express = require('express');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const https = require('https');
const { exec } = require('child_process');

const port = '7777';
const service = 'tba';
const tokenPath = path.join(os.homedir(), '.nstba');

const callback = `http://localhost:${port}/${service}`;

function openBrowser(url) {
    let command = 'xdg-open';
    if (process.platform === 'darwin') {
        command = 'open';
    } else if (process.platform === 'win32') {
        command = 'start';
    }

    exec(`${command} ${url}`).on('error', error => {
        throw error;
    });
}

class OAuth1 {
    constructor(requestConfig = {}) {
        this.version = '1.0';
        this.signatureMethod = 'HMAC-SHA256';

        if (
            (requestConfig.vm || requestConfig.molecule) &&
            (!requestConfig.key || !requestConfig.secret)
        ) {
            throw new Error('Missing parameters --key or --secret when using -m or --vm.');
        }

        requestConfig.key =
            requestConfig.key || '446765bc51e70086cf582d32f0486fc0a764354ffec6c983b94e63af331346c4';
        requestConfig.secret =
            requestConfig.secret ||
            '97fda39654d2f0cf3f0f9011d97616f96a3136e2c7659b867e57a1e1bbbcc566';
        this._initializeConfig(requestConfig);
    }

    static _callService(options) {
        const serviceUrl = urlModule.format({
            protocol: options.protocol,
            hostname: options.hostname,
            pathname: options.pathname || '',
            query: options.query || {}
        });

        const method = options.method || 'GET';
        const parseResponse = options.parseResponse !== undefined ? options.parseResponse : true;

        let output = '';

        if (options.ignoreCert) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        }

        return new Promise((resolve, reject) => {
            const req = https
                .request(serviceUrl, { headers: options.headers, method: method }, res => {
                    res.setEncoding('utf8');

                    res.on('data', chunk => {
                        output += chunk;
                    });

                    res.on('end', () => {
                        output = parseResponse ? JSON.parse(output) : output;
                        resolve(output);
                    });
                })
                .on('error', reject);

            if (['GET', 'DELETE'].indexOf(method) < 0 && options.data) {
                req.write(options.data || {});
            }
            req.end();
            delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;

        })
    }

    async soapAuthorize(tokenName, requestConfig) {
        const authToken = await this.issueToken(tokenName, requestConfig);
        if (authToken.account) {
            authToken.account = authToken.account.replace('-', '_');
        }
        return this._getSoapAuthHeader(authToken);
    }

    async restAuthorize(tokenName, requestConfig) {
        const authToken = await this.issueToken(tokenName, requestConfig);
        return this._getRestAuthHeader(requestConfig, authToken);
    }

    static getAllTokens() {
        return fs.existsSync(tokenPath)
            ? JSON.parse(fs.readFileSync(tokenPath).toString() || '{}')
            : {};
    }

    _getToken(tokenName) {
        return OAuth1.getAllTokens()[tokenName];
    }

    _setUrls() {
        const molecule = this.molecule ? `.${this.molecule}` : '';
        const hostName = this.vm && this.vm.replace(/https?:\/\//, '');

        const hostnameStep1 = this.vm ? hostName : `rest${molecule}.netsuite.com`;
        const hostnameStep2 = this.vm || `https://system${molecule}.netsuite.com`;
        const hostnameStep3 = this.vm ? hostName : `.restlets.api${molecule}.netsuite.com`;

        const step1 = `${hostnameStep1}/rest/requesttoken`;
        const step2 = `${hostnameStep2}/app/login/secure/authorizetoken.nl?oauth_token=`;
        const step3 = `${hostnameStep3}/rest/accesstoken`;

        this.urls = { step1, step2, step3 };
    }

    _setConsumer(key, secret) {
        if (key && secret) {
            this.consumer = { key, secret };
        }
    }

    _saveToken(name, content = {}) {
        const tokens = OAuth1.getAllTokens();
        tokens[name] = content;
        fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2), { mode: 0o200 });
    }

    _startLocalServer() {
        const promise = new Promise(resolve => {
            const app = express();
            let server;
            app.use(`/${service}`, (req, res) => {
                res.sendFile(path.join(__dirname, 'template.html'));
                resolve(req.query);
                server.close();
            });
            server = app.listen(port, '0.0.0.0');
        });
        return promise;
    }

    _getParameterString(oauthHeaders, request) {
        const { url, data = {} } = request;
        const searchParams = new URL(url).searchParams.entries();

        const params = this._sortObject({
            ...oauthHeaders,
            ...data,
            ...Object.fromEntries(searchParams)
        });

        const paramsString = params
            .map(param => {
                return `${param.name}=${param.value}`;
            })
            .join('&');

        return paramsString;
    }

    _getSigningKey(secret = '') {
        const signingKey = [this._encode(this.consumer.secret), this._encode(secret)].join('&');
        return signingKey;
    }

    _getSignature(baseString, secret) {
        const key = this._getSigningKey(secret);
        const hash = crypto.createHmac('sha256', key);
        hash.update(baseString);
        return hash.digest('base64');
    }

    _getRestSignature(oauthHeaders, request, secret) {
        const { method, url } = request;
        const [baseUrl] = url.split('?');
        const baseString = [
            method.toUpperCase(),
            this._encode(baseUrl.toLowerCase()),
            this._encode(this._getParameterString(oauthHeaders, request))
        ].join('&');
        return this._getSignature(baseString, secret);
    }

    _getSoapSignature(account, token, nonce, timestamp) {
        const baseString = [account, this.consumer.key, token.token, nonce, timestamp].join('&');
        return this._getSignature(baseString, token.secret);
    }

    _encode(data) {
        return encodeURIComponent(data)
            .replace(/!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
    }

    _sortObject(headers) {
        const keys = Object.keys(headers).sort();
        return keys.map(name => {
            return { name: this._encode(name), value: this._encode(headers[name]) };
        });
    }

    _getTimestamp() {
        return parseInt(new Date().getTime() / 1000, 10);
    }

    _getNonce() {
        return crypto.randomBytes(10).toString('hex');
    }

    _getSoapAuthHeader(authToken) {
        const nonce = this._getNonce();
        const timestamp = this._getTimestamp();
        const { account, token } = authToken;
        const signature = this._getSoapSignature(account, authToken, nonce, timestamp);
        return {
            token,
            signature,
            nonce,
            timestamp,
            account,
            consumerKey: this.consumer.key
        };
    }

    _getRestAuthHeader(request, token = {}) {
        const HEADER = 'OAuth';
        const oauthHeaders = {
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

        const sortedHeaders = this._sortObject(oauthHeaders);

        const { account } = token;
        if (account) {
            sortedHeaders.push({ name: 'realm', value: account.replace('-', '_') });
        }
        const headerString = sortedHeaders
            .map(header => {
                return `${header.name}="${header.value}"`;
            })
            .join(', ');

        return `${HEADER} ${headerString}`;
    }

    async _baseStep(restMethod, params) {
        const request = {
            protocol: 'https',
            hostname: restMethod,
            method: 'POST',
            headers: {},
            parseResponse: false,
            ignoreCert: !!this.vm
        };
        request.url = urlModule.format({
            protocol: request.protocol,
            hostname: request.hostname
        });
        request.headers.Authorization = this._getRestAuthHeader(request, params);
        const response = await OAuth1._callService(request);
        const { oauth_token: token, oauth_token_secret: secret } = querystring.parse(
            response.trim()
        );

        let responseJSON;
        try {
            responseJSON = JSON.parse(response.trim());
        } catch (e) {
            responseJSON = {};
        }

        if (responseJSON.error) {
            throw new Error(responseJSON.error.message);
        }

        return { token: token, secret: secret, account: params.account };
    }

    async _step1() {
        return this._baseStep(this.urls.step1, { callback });
    }

    _step2(key) {
        const promise = this._startLocalServer();
        const loginUrl = this.urls.step2 + key;
        openBrowser(loginUrl);

        return promise;
    }

    _setVm(vm) {
        if (!vm) {
            return;
        }
        if (typeof vm !== 'string') {
            throw new Error('Invalid VM URL.');
        }
        this.vm = vm;
    }

    _setMolecule(molecule) {
        if (!molecule) {
            return;
        }
        if (typeof molecule !== 'string') {
            throw new Error('Invalid molecule.');
        }
        this.molecule = molecule;
    }

    async _step3(account, token, verifier, secret) {
        const params = { account, token, verifier, secret };
        return this._baseStep(`${this.vm ? '' : account}${this.urls.step3}`, params);
    }

    async issueToken(tokenName, requestConfig = {}) {
        if (!tokenName) {
            throw new Error('Missing token name.');
        }

        this._initializeConfig(requestConfig);
        let authToken = this._getToken(tokenName);

        if (!authToken || !authToken.token) {
            const { token, secret } = await this._step1();
            const { company, oauth_token, oauth_verifier } = await this._step2(token);
            authToken = await this._step3(
                company.replace('_', '-'), // do not remove the replace in order to support sandbox account
                oauth_token,
                oauth_verifier,
                secret
            );
            this._saveToken(tokenName, authToken);
        }

        return authToken;
    }

    _initializeConfig(requestConfig) {
        this._setVm(requestConfig.vm);
        this._setMolecule(requestConfig.molecule);
        this._setUrls();
        this._setConsumer(requestConfig.key, requestConfig.secret);
    }
}

module.exports = {
    OAuth1,
    openBrowser
};
