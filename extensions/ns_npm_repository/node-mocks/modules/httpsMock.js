const testResultString = 'testResultMock';
const requestMock = {
    on: jest.fn((event, onCallback) => {
        onCallback(Buffer.from(testResultString), requestMock);
        return {
            write: jest.fn(),
            end: jest.fn()
        };
    }),
    end: jest.fn(),
    write: jest.fn()
};

module.exports = {
    mock() {
        return {
            request: jest.fn((uri, options, requestCallback = options) => {
                if (requestCallback) {
                    requestCallback(requestMock);
                }
                return requestMock;
            })
        };
    },
    testResultString,
    requestMock
};
