const { mockHttp, mockHttps } = require('node-mocks');

const http = require('http');
const https = require('https');

const nsRequest = require('../index');

jest.mock('http', () => mockHttp.mock());
jest.mock('https', () => mockHttps.mock());

const testProxyHost = 'proxy.com';
const testProxyPort = '8080';
const testUrlHttp = 'http://test.com';
const testUrlHttps = 'https://test.com';
const { testResultString, requestMock } = mockHttps;

describe('ns-request', () => {
    beforeEach(() => {
        http.request.mockClear();
        https.request.mockClear();
        requestMock.end.mockClear();
    });
    describe('get', () => {
        it('should call http with GET method', async () => {
            await nsRequest.get(testUrlHttps);

            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    method: 'GET'
                }),
                expect.any(Function)
            );
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should make a simple get request when the only parameter is a url', async () => {
            const result = await nsRequest.get(testUrlHttps);

            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    method: 'GET',
                    timeout: 0
                }),
                expect.any(Function)
            );
            expect(result).toBe(testResultString);
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should throw an error if url is not a string', async () => {
            expect(() => nsRequest.get(10)).toThrowError();
        });
        it('should make a get request using options when parameter is an object', async () => {
            const options = {
                headers: { origin: testUrlHttps },
                method: 'GET',
                timeout: 0,
                path: testUrlHttps
            };

            const result = await nsRequest.get(options);

            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    headers: { origin: testUrlHttps },
                    method: 'GET',
                    timeout: 0
                }),
                expect.any(Function)
            );
            expect(result).toBe(testResultString);
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should use http node module if the url is using http and not https', async () => {
            await nsRequest.get(testUrlHttp);

            expect(http.request).toBeCalledTimes(1);
            expect(https.request).not.toBeCalled();
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should make the get request (HTTP) using a proxy if proxy url is in options', async () => {
            const result = await nsRequest.get(testUrlHttp, {
                proxy: `${testProxyHost}:${testProxyPort}`
            });

            expect(http.request).lastCalledWith(
                expect.objectContaining({
                    path: testUrlHttp,
                    host: testProxyHost,
                    port: testProxyPort
                }),
                expect.any(Function)
            );
            expect(result).toBe(testResultString);
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should make the get request (HTTPS) using a proxy if proxy url is in options', async () => {
            const result = await nsRequest.get(testUrlHttps, {
                proxy: `${testProxyHost}:${testProxyPort}`
            });

            expect(http.request).lastCalledWith(
                expect.objectContaining({
                    path: testUrlHttps,
                    method: 'CONNECT',
                    host: testProxyHost,
                    port: testProxyPort
                })
            );
            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    socket: expect.any(Object),
                    path: testUrlHttps
                }),
                expect.any(Function)
            );
            expect(result).toBe(testResultString);
            expect(requestMock.end).toHaveBeenCalledTimes(2);
        });
    });
    describe('POST', () => {
        it('should call http with POST method', async () => {
            await nsRequest.post(testUrlHttps);

            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    method: 'POST'
                }),
                expect.any(Function)
            );
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
    });
    describe('put', () => {
        it('should call http with PUT method', async () => {
            await nsRequest.put(testUrlHttps);

            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining({
                    method: 'PUT'
                }),
                expect.any(Function)
            );
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
        it('should make a put request with body', async () => {
            const body = JSON.stringify({ val: 5 });
            await nsRequest.put(testUrlHttps, { body });

            expect(requestMock.write).lastCalledWith(body);
            expect(requestMock.end).toHaveBeenCalledTimes(1);
        });
    });
    describe('defaults', () => {
        it('should set defaults options to be used in all requests', async () => {
            const options = { headers: { origin: testUrlHttps } };
            nsRequest.defaults(options);
            await nsRequest.get(testUrlHttps);
            expect(https.request).lastCalledWith(
                testUrlHttps,
                expect.objectContaining(options),
                expect.any(Function)
            );
        });
    });
});
