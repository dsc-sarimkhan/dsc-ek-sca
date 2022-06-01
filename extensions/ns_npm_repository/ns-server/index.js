const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

async function sendFile(request, response, filePath) {
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    const content = await fs.promises.readFile(filePath);

    response.writeHead(200, { 'Content-Type': contentType });
    response.write(content);
    response.end();
}

function parentNext(request, response, stack, jdx) {
    return function next() {
        if (jdx < stack.length) {
            request.query = stack[jdx].query;
            request.params = stack[jdx].params;
            const cb = stack[jdx].callback;

            cb(request, response, parentNext(request, response, stack, jdx + 1));
        } else {
            response.writeHead(404);
            response.write(`Cannot GET ${request.url}`);
            response.end();
        }
    };
}

function createServer(options = {}) {
    const routes = [];
    let server;

    function serverCall(request, response) {
        let basePath = '/';
        const stack = [];

        const urlFull = new URL(request.url, 'http://dummy/');
        const url = urlFull.pathname;

        // Iterate on all the routes registered with the 'use' method
        for (let i = 0; i < routes.length; i++) {
            const route = routes[i];
            const stackRoute = {};
            stackRoute.query = Object.fromEntries(urlFull.searchParams);
            const argsVal = url.match(route.urlRegex);

            if (argsVal) {
                // Adding all the routes that matches the current url
                stack.push(stackRoute);
                basePath = route.url;

                const argsNames = route.url.match(/(:\w+)/g);

                if (argsNames) {
                    argsVal.shift();
                    stackRoute.params = {};

                    for (let j = 0; j < argsNames.length; j++) {
                        stackRoute.params[argsNames[j].slice(1)] = argsVal[j];
                    }
                }

                if (typeof route.callbackPath === 'function') {
                    stackRoute.callback = route.callbackPath;
                } else {
                    let filePath = '';

                    if (basePath !== url) {
                        filePath = url.replace(basePath, '');
                    }

                    filePath = path.join(route.callbackPath, filePath);

                    stackRoute.callback = function(req, res, next) {
                        sendFile(req, res, filePath).catch(() => {
                            // If we don't find the file, we pass to the next route
                            next();
                        });
                    };
                }
            }
        }

        if (stack.length) {
            response.send = function(data) {
                response.end.call(response, data);
            };

            response.json = function(data) {
                response.end.call(response, JSON.stringify(data));
            };

            response.sendFile = function(filePath) {
                sendFile(request, response, filePath).catch(() => {
                    response.writeHead(404);
                    response.write(`Cannot GET ${filePath}`);
                    response.end();
                });
            };

            request.query = stack[0].query;
            request.params = stack[0].params;
            stack[0].callback(request, response, parentNext(request, response, stack, 1));
        } else {
            response.writeHead(404);
            response.write(`Cannot GET ${request.url}`);
            response.end();
        }
    }

    if (options.secure) {
        server = https.createServer(options, serverCall);
    } else {
        server = http.createServer(options, serverCall);
    }

    return {
        use: function(reqUrl, callbackPath) {
            if (typeof reqUrl === 'function') {
                callbackPath = reqUrl;
                reqUrl = '/';
            }

            const use = {
                url: reqUrl,
                urlRegex: new RegExp(`^${reqUrl.replace(/(:\w+)/g, '([\\w-]+)')}`),
                callbackPath: callbackPath
            };

            routes.push(use);
        },
        listen: function() {
            server.listen.apply(server, arguments);
        },
        close: function() {
            server.close.apply(server, arguments);
        }
    };
}

module.exports = {
    createServer
};
