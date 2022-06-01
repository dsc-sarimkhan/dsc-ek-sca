module.exports = {
    mock() {
        return { randomBytes: jest.fn(), createHmac: jest.fn()};
    }
};
