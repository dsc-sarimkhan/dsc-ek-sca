/* eslint-disable */

let httpServer;

jest.mock('http', () => {
    let httpData;
    httpServer = {
        createServer: (options, serverCall) => {
            httpData = { write: [] };
            httpData.serverCall = serverCall;
            return {
                listen: () => {},
                close: () => {}
            };
        },
        fetch: (url) => {
            const request = {
                url: url
            };
            const response = {
                writeHead: (status, data) => {
                    httpData.headerStatus = status;
                    httpData.headerData = data;
                },
                write: (data) => {
                    httpData.write.push(data);
                },
                end: (data) => {
                    if (data) {
                        httpData.write.push(data);
                    }
                    httpData.end = true;
                }
            };
            httpData.serverCall(request, response);
        },
        getData: (key) => {
            return httpData[key];
        }
    };

    return httpServer;
});

jest.mock('fs', () => ({
    promises: {
        readFile: (file) => {
            if (file.indexOf('file-not-found') !== -1) {
                throw 'File Not Found';
            } else {
                const promise = new Promise((resolve, reject) => {
                    resolve(`Data of ${file}`);
                });

                return promise;
            }
        }
    }
}));

const http = require('http');
const fs = require('fs');
const nsServer = require('ns-server');

// This method is to wait for the promises to be resolved
function flushPromises() {
    return new Promise(setImmediate);
}

describe('NS Server', () => {
    describe('Create a server with middleware callback', () => {
        it('Callback of the middleware must be called with "/"', (cb) => {
            const server = nsServer.createServer();

            server.use((request, response, next) => {
                expect(request.url).toBe('/');
            });

            httpServer.fetch('/');

            cb();
        });

        it('Callback of the middleware must be called with "/test02"', (cb) => {
            const server = nsServer.createServer();

            server.use((request, response, next) => {
                expect(request.url).toBe('/test02');
            });

            httpServer.fetch('/test02');

            cb();
        });

        it('Callback of 2 middleware must be called with "/test03"', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use((request, response, next) => {
                expect(request.url).toBe('/test03');
                callStack.push('a');
                next();
            });

            server.use((request, response, next) => {
                callStack.push('b');
                expect(request.url).toBe('/test03');
                next();
            });

            httpServer.fetch('/test03');

            expect(callStack).toEqual(['a', 'b']);
            cb();
        });
    });

    describe('Create a server with routes callback', () => {
        it('Callback called of a route with "/"', (cb) => {
            const server = nsServer.createServer();

            server.use('/', (request, response, next) => {
                expect(request.url).toBe('/');
            });

            httpServer.fetch('/');

            cb();
        });

        it('Callback of all routes that apply', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use('/', (request, response, next) => {
                expect(request.url).toBe('/test04');
                callStack.push('a');
                next();
            });

            server.use('/test04', (request, response, next) => {
                expect(request.url).toBe('/test04');
                callStack.push('b');
            });

            httpServer.fetch('/test04');

            expect(callStack).toEqual(['a', 'b']);
            cb();
        });

        it('Callback of all routes that apply (/test05)', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use('/test01', (request, response, next) => {
                expect(request.url).toBe('/test05');
                callStack.push('a');
            });

            server.use('/test05', (request, response, next) => {
                expect(request.url).toBe('/test05');
                callStack.push('b');
            });

            httpServer.fetch('/test05');

            expect(callStack).toEqual(['b']);
            cb();
        });
    });

    describe('Create a server with middleware and routes callback', () => {
        it('Callback of all routes that apply (/test06)', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use((request, response, next) => {
                expect(request.url).toBe('/test06');
                callStack.push('a');
                next();
            });

            server.use('/', (request, response, next) => {
                expect(request.url).toBe('/test06');
                callStack.push('b');
                next();
            });

            server.use((request, response, next) => {
                expect(request.url).toBe('/test06');
                callStack.push('c');
                next();
            });

            server.use('/test06', (request, response, next) => {
                expect(request.url).toBe('/test06');
                callStack.push('d');
                next();
            });

            httpServer.fetch('/test06');

            expect(callStack).toEqual(['a', 'b', 'c', 'd']);
            cb();
        });

        it('Callback of all routes that apply until no next (/test07)', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use((request, response, next) => {
                expect(request.url).toBe('/test07');
                callStack.push('a');
                next();
            });

            server.use('/', (request, response, next) => {
                expect(request.url).toBe('/test07');
                callStack.push('b');
            });

            server.use((request, response, next) => {
                expect(request.url).toBe('/test07');
                callStack.push('c');
                next();
            });

            server.use('/test07', (request, response, next) => {
                expect(request.url).toBe('/test07');
                callStack.push('d');
                next();
            });

            httpServer.fetch('/test07');

            expect(callStack).toEqual(['a', 'b']);
            cb();
        });

        it('Callback of all routes that apply (/test08)', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use((request, response, next) => {
                expect(request.url).toBe('/test08/subtest');
                callStack.push('a');
                next();
            });

            server.use('/', (request, response, next) => {
                expect(request.url).toBe('/test08/subtest');
                callStack.push('b');
                next();
            });

            server.use('/no-test', (request, response, next) => {
                expect(request.url).toBe('/no-test');
                callStack.push('c');
                next();
            });

            server.use((request, response, next) => {
                expect(request.url).toBe('/test08/subtest');
                callStack.push('d');
                next();
            });

            server.use('/test08', (request, response, next) => {
                expect(request.url).toBe('/test08/subtest');
                callStack.push('e');
                next();
            });

            httpServer.fetch('/test08/subtest');

            expect(callStack).toEqual(['a', 'b', 'd', 'e']);
            cb();
        });
    });

    describe('Create a server with routes, url parameters and callback', () => {
        it('Callback with url parameters', (cb) => {
            const server = nsServer.createServer();

            server.use('/test09/:app', (request, response, next) => {
                expect(request.url).toBe('/test09/appTest');
                expect(request.params).toEqual({ app: 'appTest' });
            });

            httpServer.fetch('/test09/appTest');

            cb();
        });

        it('Each callback with their respective url parameters', (cb) => {
            const server = nsServer.createServer();
            const callStack = [];

            server.use('/test10/:app/:opp', (request, response, next) => {
                callStack.push('a');
                expect(request.url).toBe('/test10/appTest/oppTest');
                expect(request.params).toEqual({ app: 'appTest', opp: 'oppTest' });
                next();
            });

            server.use('/test10/:upp', (request, response, next) => {
                callStack.push('b');
                expect(request.url).toBe('/test10/appTest/oppTest');
                expect(request.params).toEqual({ upp: 'appTest' });
                next();
            });

            server.use('/test10/:epp/:ipp', (request, response, next) => {
                callStack.push('c');
                expect(request.url).toBe('/test10/appTest/oppTest');
                expect(request.params).toEqual({ epp: 'appTest', ipp: 'oppTest' });
                next();
            });

            httpServer.fetch('/test10/appTest/oppTest');

            expect(callStack).toEqual(['a', 'b', 'c']);

            cb();
        });
    });

    describe('Check status of the response', () => {
        it('Check 404', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test11', 'C:\\MyDirectory');

            httpServer.fetch('/test11/file-not-found.jpg');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(404);
            expect(httpServer.getData('write')).toEqual(['Cannot GET /test11/file-not-found.jpg']);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 200 jpg', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test12', 'C:\\MyDirectory');

            httpServer.fetch('/test12/file.jpg');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(200);
            expect(httpServer.getData('headerData')).toEqual({ 'Content-Type': 'image/jpg' });
            expect(httpServer.getData('write')).toEqual(['Data of C:\\MyDirectory\\file.jpg']);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 404 multiple urls', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test13', 'C:\\MyDirectory');
            server.use('/', 'C:\\RootDirectory');

            httpServer.fetch('/test13/file-not-found.jpg');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(404);
            expect(httpServer.getData('write')).toEqual(['Cannot GET /test13/file-not-found.jpg']);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 404 no routes match', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test14', 'C:\\MyDirectory');

            httpServer.fetch('/no-match/file-not-found.jpg');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(404);
            expect(httpServer.getData('write')).toEqual([
                'Cannot GET /no-match/file-not-found.jpg'
            ]);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 404 response send file', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test14', (request, response, next) => {
                response.sendFile('C:\\MyDirectory\\file-not-found.jpg');
            });

            httpServer.fetch('/test14');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(404);
            expect(httpServer.getData('write')).toEqual([
                'Cannot GET C:\\MyDirectory\\file-not-found.jpg'
            ]);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 200 gif response send file', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test15', 'C:\\MyDirectory');

            httpServer.fetch('/test15/file.wav');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(200);
            expect(httpServer.getData('headerData')).toEqual({ 'Content-Type': 'audio/wav' });
            expect(httpServer.getData('write')).toEqual(['Data of C:\\MyDirectory\\file.wav']);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });

        it('Check 200 multiple urls', async (cb) => {
            const server = nsServer.createServer();

            server.use('/test13', 'C:\\Directory\\file-not-found');
            server.use('/', 'C:\\RootDirectory');

            httpServer.fetch('/test13/index.html');

            await flushPromises();

            expect(httpServer.getData('headerStatus')).toBe(200);
            expect(httpServer.getData('headerData')).toEqual({ 'Content-Type': 'text/html' });
            expect(httpServer.getData('write')).toEqual([
                'Data of C:\\RootDirectory\\test13\\index.html'
            ]);
            expect(httpServer.getData('end')).toBe(true);

            cb();
        });
    });
});
