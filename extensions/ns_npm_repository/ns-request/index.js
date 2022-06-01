const http = require('http');
const https = require('https');

let defaultOptions = {};

function isHttps(uri) {
    return uri.startsWith('https');
}

function processRequest(resolve, reject, args) {
    const requestArgs = args.uri ? [args.uri, args.params] : [args.params];
    const request = (isHttps(args.uri || args.params.path) ? https : http).request(...requestArgs, response => {
        const data = [];
        response.on('data', chunk => data.push(chunk));
        response.on('end', () => resolve(Buffer.concat(data).toString()));
    });

    request.on('error', reject);

    if (args.params.method !== 'GET' && args.params.body) {
        request.write(args.params.body);
    }

    request.end();
}

function httpProxyPromise(params) {
    return new Promise((resolve, reject) => {
        params = {
            ...params,
            ...{ host: params.proxy.host, port: params.proxy.port }
        };
        processRequest(resolve, reject, { params });
    });
}

function noProxyPromise(params) {
    return new Promise((resolve, reject) => {
        const uri = params.path;
        delete params.path;
        processRequest(resolve, reject, { params, uri });
    });
}

function httpsProxyPromise(params) {
    return new Promise((resolve, reject) => {
        const proxyRequest = http.request({
            ...params,
            ...{ host: params.proxy.host, port: params.proxy.port, method: 'CONNECT' }
        });
        proxyRequest.on('connect', (res, socket) => {
            params.socket = socket;
            processRequest(resolve, reject, { params, uri: params.path });
        });
        proxyRequest.on('error', reject);
        proxyRequest.end();
    });
}

function buildOptions(uri, options) {
    const defaultPath = { path: options.path || uri };
    options = {
        ...defaultOptions,
        ...(typeof options === 'object' ? { ...options, ...defaultPath } : defaultPath)
    };

    if (typeof options.path !== 'string') {
        throw new Error('invalid URI');
    }

    if (isNaN(options.timeout)) {
        options.timeout = 0;
    }

    if (options.proxy) {
        const [host, port = 80] = options.proxy.replace(/https?:\/\//, '').split(':');
        options.proxy = { host, port };
    }

    return options;
}

function createPromise(uri, options, method = 'GET') {
    const params = buildOptions(uri, options);
    params.method = method;
    let promise;
    if (params.proxy) {
        promise = isHttps(params.path) ? httpsProxyPromise(params) : httpProxyPromise(params);
    } else {
        promise = noProxyPromise(params);
    }
    return promise;
}

module.exports = {
    get(uri, options = uri) {
        return createPromise(uri, options, 'GET');
    },

    put(uri, options = uri) {
        return createPromise(uri, options, 'PUT');
    },

    post(uri, options = uri) {
        return createPromise(uri, options, 'POST');
    },

    defaults(options) {
        defaultOptions = { ...defaultOptions, ...options };
    }
};
