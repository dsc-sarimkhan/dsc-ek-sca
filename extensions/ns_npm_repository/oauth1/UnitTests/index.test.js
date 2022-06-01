const {
    mockChild_process,
    mockCrypto,
    mockFs,
    mockOs,
    mockPath,
    mockQuerystring,
    mockUrl
} = require('node-mocks');

const fs = require('fs');
const crypto = require('crypto');
const url = require('url');
const nsRequest = require('ns-request');
const { exec } = require('child_process');
const queryString = require('querystring');
const nsServer = require('ns-server');

const OAuth = require('oauth1');

const { OAuth1, openBrowser } = OAuth;

jest.mock('child_process', () => mockChild_process.mock());
jest.mock('crypto', () => mockCrypto.mock());
jest.mock('ns-server', () => ({
    createServer: jest.fn()
}));
jest.mock('fs', () => mockFs.mock());
jest.mock('ns-request', () => {
    return {
        post: jest.fn(),
        get: jest.fn(),
        defaults: jest.fn()
    };
});
jest.mock('os', () => mockOs.mock());
jest.mock('path', () => mockPath.mock());
jest.mock('querystring', () => mockQuerystring.mock());
jest.mock('url', () => mockUrl.mock());

const testKey = '0000000000000000000000000000000000000000000000000000000000000000';
const testSecret = '1111111111111111111111111111111111111111111111111111111111111111';

describe('OAuth1', () => {
    describe('constructor', () => {
        it('should throw error if is vm or molecule and there is no key and secret', () => {
            const options = { molecule: 'f' };

            expect(() => new OAuth1(options)).toThrow(
                new Error('Missing parameters --key or --secret when using -m or --vm.')
            );
        });

        it('should throw error if vm is invalid', () => {
            const options = { vm: 1, key: testKey, secret: testSecret };

            expect(() => new OAuth1(options)).toThrow(new Error('Invalid VM URL.'));
        });

        it('should throw error if molecule is invalid', () => {
            const options = { molecule: 1, key: testKey, secret: testSecret };

            expect(() => new OAuth1(options)).toThrow(new Error('Invalid molecule.'));
        });

        it('should create the OAuth1 instance successfully without options', () => {
            const oauth1 = new OAuth1();

            expect(oauth1.vm).toBe(undefined);
            expect(oauth1.molecule).toBe(undefined);
            expect(oauth1.consumer.key).toBe(
                '446765bc51e70086cf582d32f0486fc0a764354ffec6c983b94e63af331346c4'
            );
            expect(oauth1.consumer.secret).toBe(
                '97fda39654d2f0cf3f0f9011d97616f96a3136e2c7659b867e57a1e1bbbcc566'
            );
        });

        it('should create the OAuth1 instance successfully with molecule options', () => {
            const molecule = 'f';
            const options = { molecule, key: testKey, secret: testSecret };

            const oauth1 = new OAuth1(options);

            expect(oauth1.molecule).toBe(molecule);
            expect(oauth1.consumer.key).toBe(testKey);
            expect(oauth1.consumer.secret).toBe(testSecret);
            expect(oauth1.urls.step1).toContain('rest.f.netsuite.com');
            expect(oauth1.urls.step2).toContain('system.f.netsuite.com');
            expect(oauth1.urls.step3).toContain('restlets.api.f.netsuite');
        });

        it('should create the OAuth1 instance successfully with vm options', () => {
            const vmDomain = 'testvm.com';
            const vm = `http://${vmDomain}`;
            const options = { vm, key: testKey, secret: testSecret };

            const oauth1 = new OAuth1(options);

            expect(oauth1.vm).toBe(vm);
            expect(oauth1.consumer.key).toBe(testKey);
            expect(oauth1.consumer.secret).toBe(testSecret);
            expect(oauth1.urls.step1).toContain(vmDomain);
            expect(oauth1.urls.step2).toContain(vmDomain);
            expect(oauth1.urls.step3).toContain(vmDomain);
        });
    });

    describe('_callService', () => {
        it('should return the response when the request end', async () => {
            const testResponse = "{ test: 'value' }";
            url.format.mockReturnValueOnce('http://test.com');
            const requestPromiseMock = (url, opt, cb = function() {}) => {
                cb(testResponse);
                return testResponse;
            };
            nsRequest.post.mockImplementationOnce(requestPromiseMock);
            nsRequest.get.mockImplementationOnce(requestPromiseMock);

            const result = await OAuth1._callService({ ignoreCert: true });
            expect(result).toBe(testResponse);
        });

        it('should return error if the request fails', async () => {
            const testError = new Error('Test Error');
            const requestPromiseMock = (url, opt, cb) => {
                throw testError;
            };
            nsRequest.post.mockImplementationOnce(requestPromiseMock);
            nsRequest.get.mockImplementationOnce(requestPromiseMock);

            let throwedTestError;
            try {
                await OAuth1._callService({ ignoreCert: true });
            } catch (e) {
                throwedTestError = e;
            }

            expect(throwedTestError).toBe(testError);
        });
    });

    describe('getAllTokens', () => {
        it('should return file content if token file path exists', () => {
            const jsonContent = '{"test":"test"}';

            fs.existsSync.mockReturnValueOnce(true);
            fs.readFileSync.mockImplementationOnce(() => ({
                toString: jest.fn(() => jsonContent)
            }));

            expect(JSON.stringify(OAuth1.getAllTokens())).toBe(jsonContent);
        });

        it('should return empty object if token file exists but is empty', () => {
            const jsonContent = '{}';

            fs.existsSync.mockReturnValueOnce(true);
            fs.readFileSync.mockImplementationOnce(() => ({
                toString: jest.fn(() => jsonContent)
            }));

            expect(JSON.stringify(OAuth1.getAllTokens())).toBe(jsonContent);
        });

        it('should return empty object if token file path does not exists', () => {
            const jsonContent = '{}';

            fs.existsSync.mockReturnValueOnce(false);
            fs.readFileSync.mockImplementationOnce(() => ({
                toString: jest.fn(() => jsonContent)
            }));

            expect(JSON.stringify(OAuth1.getAllTokens())).toBe(jsonContent);
        });
    });

    describe('soapAuthorize', () => {
        const nonce = 'dfsdf';
        const account = '1234';
        const secret = '00000aaa0000';
        const token = '234543fdgdfgdfgv4563';

        let authorization;
        let oauth1 = new OAuth1();

        beforeEach(() => {
            crypto.randomBytes.mockImplementationOnce(() => ({
                toString: jest.fn(() => nonce)
            }));
            crypto.createHmac.mockImplementationOnce(() => ({
                update: jest.fn(),
                digest: jest.fn()
            }));
            oauth1 = new OAuth1();
        });

        it('should throw an error if token name is null', async () => {
            await expect(oauth1.soapAuthorize(null)).rejects.toThrow(
                new Error('Missing token name.')
            );
        });

        describe('should return a soap authorization object', () => {
            beforeEach(() => {
                oauth1.issueToken = jest.fn(() => {
                    return { token: token, secret: secret, account: account };
                });
            });

            afterEach(async () => {
                await expect(authorization).resolves.toHaveProperty('token', token);
                await expect(authorization).resolves.toHaveProperty('signature');
                await expect(authorization).resolves.toHaveProperty('nonce', nonce);
                await expect(authorization).resolves.toHaveProperty('timestamp');
                await expect(authorization).resolves.toHaveProperty('account', account);
                await expect(authorization).resolves.toHaveProperty('consumerKey');
            });

            it('with token param', () => {
                authorization = oauth1.soapAuthorize('tokenName');
            });

            it('with token and request configuration params', () => {
                authorization = oauth1.soapAuthorize('tokenName', { molecule: 'f' });
            });
        });
    });

    describe('restAuthorize', () => {
        const nonce = 'dfsdf';
        let oauth1 = new OAuth1();
        const account = '1234';
        const secret = '00000aaa0000';
        const token = '234543fdgdfgdfgv4563';

        beforeEach(() => {
            crypto.randomBytes.mockImplementationOnce(() => ({
                toString: jest.fn(() => nonce)
            }));
            crypto.createHmac.mockImplementationOnce(() => ({
                update: jest.fn(),
                digest: jest.fn()
            }));
            oauth1 = new OAuth1();
        });

        it('should throw an error if token name is null', async () => {
            await expect(oauth1.restAuthorize(null)).rejects.toThrow(
                new Error('Missing token name.')
            );
        });

        it('should throw an error with non http method defined on request configuration', async () => {
            const requestConfig = {
                url: 'http://localhost:8080'
            };
            oauth1.issueToken = jest.fn(() => {
                return { token: token, secret: secret, account: account };
            });
            const restAuthorization = oauth1.restAuthorize('token', requestConfig);

            await expect(restAuthorization).rejects.toThrow();
        });

        it('should throw an error with non url defined on request configuration', async () => {
            const requestConfig = {
                method: 'POST'
            };
            oauth1.issueToken = jest.fn(() => {
                return { token: token, secret: secret, account: account };
            });
            const restAuthorization = oauth1.restAuthorize('token', requestConfig);

            await expect(restAuthorization).rejects.toThrow();
        });

        it('should return the rest authorization header', async () => {
            const requestConfig = {
                method: 'POST',
                url: 'http://localhost:8080'
            };
            oauth1.issueToken = jest.fn(() => {
                return { token: token, secret: secret, account: account };
            });
            const restAuthorization = oauth1.restAuthorize('token', requestConfig);

            await expect(restAuthorization).resolves.toContain('OAuth');
            await expect(restAuthorization).resolves.toContain('oauth_consumer_key');
            await expect(restAuthorization).resolves.toContain(`oauth_nonce="${nonce}"`);
            await expect(restAuthorization).resolves.toContain(
                'oauth_signature_method="HMAC-SHA256"'
            );
            await expect(restAuthorization).resolves.toContain('oauth_timestamp');
            await expect(restAuthorization).resolves.toContain(`oauth_token="${token}"`);
            await expect(restAuthorization).resolves.toContain('oauth_version="1.0"');
            await expect(restAuthorization).resolves.toContain(`realm="${account}"`);
        });
    });

    describe('issueToken', () => {
        let oauth1;
        const tokenName = 'tokenName';

        beforeEach(() => {
            oauth1 = new OAuth1();
        });
        it('should throw an error if token name is null', async () => {
            await expect(oauth1.issueToken(null)).rejects.toThrow(new Error('Missing token name.'));
        });

        it('should throw an error if vm is invalid', async () => {
            await expect(oauth1.issueToken(tokenName, { vm: 1 })).rejects.toThrow(
                new Error('Invalid VM URL.')
            );
        });

        it('should throw an error if molecule is invalid', async () => {
            await expect(oauth1.issueToken(tokenName, { molecule: {} })).rejects.toThrow(
                new Error('Invalid molecule.')
            );
        });

        it('should return an existing authorization token', async () => {
            const authToken = { token: 'dfasdft43454sf', secret: '34efedf435', account: '1234' };
            oauth1._getToken = jest.fn(() => {
                return authToken;
            });
            const authTokenResult = oauth1.issueToken(tokenName);
            await expect(authTokenResult).resolves.toHaveProperty('token', authToken.token);
            await expect(authTokenResult).resolves.toHaveProperty('account', authToken.account);
            await expect(authTokenResult).resolves.toHaveProperty('secret', authToken.secret);
        });

        it('should throw an error if bad response', async () => {
            const error = 'response error';
            jest.spyOn(OAuth1, '_callService').mockImplementationOnce(() => {
                return `{ "error": { "message": "${error}" } }`;
            });
            queryString.parse.mockImplementationOnce(() => {
                return { oauth_token: testKey, oauth_token_secret: testSecret };
            });

            await expect(oauth1.issueToken(tokenName)).rejects.toThrow(new Error(error));
        });

        it('should return a new authorization token', async () => {
            const account = '1234';
            const secret = '123dfdsfy676df6876asdaREW';
            const token = 'DCVE$%&sfdgdsg%$6&%56rtgdfg%$&sad342ras2';
            const oauth_token = 'token1';

            url.format.mockImplementationOnce(() => 'http://unaurl');
            crypto.randomBytes.mockImplementationOnce(() => ({
                toString: jest.fn(() => nonce)
            }));
            oauth1._getToken = jest.fn(() => {
                return {};
            });

            jest.spyOn(OAuth1, '_callService').mockImplementation(() => {
                return '';
            });

            queryString.parse.mockImplementation(() => {
                return { oauth_token: token, oauth_token_secret: secret };
            });

            nsServer.createServer.mockReturnValueOnce({
                use: jest.fn((name, cb) => {
                    cb(
                        {
                            query: {
                                company: account,
                                oauth_token: oauth_token,
                                oauth_verifier: 'oauth_verifier'
                            }
                        },
                        { sendFile: jest.fn() }
                    );
                }),
                listen: jest.fn().mockReturnValueOnce(() => ({ close: jest.fn() }))
            });

            oauth1._getRestAuthHeader = jest.fn(() => {
                return `OAuth oauth_consumer_key="446765bc51e70086cf582d32f0486fc0a764354ffec6c983b94e63af331346c4", oauth_nonce="dfsdf", oauth_signature_method="HMAC-SHA256", oauth_timestamp="1610641817", oauth_token="${oauth_token}", oauth_version="1.0", realm="${account}"`;
            });

            const authTokenResult = oauth1.issueToken(tokenName);
            await expect(authTokenResult).resolves.toHaveProperty('token', token);
            await expect(authTokenResult).resolves.toHaveProperty('account', account);
            await expect(authTokenResult).resolves.toHaveProperty('secret', secret);
        });
    });
});

describe('openBrowser', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should call open command on mac', () => {
        const testUrl = 'http://www.domain.test';
        Object.defineProperty(process, 'platform', { value: 'darwin' });

        openBrowser(testUrl);

        expect(exec).toBeCalledWith(`open ${testUrl}`);
    });

    it('should call start command on windows', () => {
        const testUrl = 'http://www.domain.test';
        Object.defineProperty(process, 'platform', { value: 'win32' });

        openBrowser(testUrl);

        expect(exec).toBeCalledWith(`start ${testUrl}`);
    });

    it('should call xdg-open command by default', () => {
        const testUrl = 'http://www.domain.test';
        Object.defineProperty(process, 'platform', { value: 'other' });

        openBrowser(testUrl);

        expect(exec).toBeCalledWith(`xdg-open ${testUrl}`);
    });
});
