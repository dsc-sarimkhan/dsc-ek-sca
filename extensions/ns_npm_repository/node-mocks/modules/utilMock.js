module.exports = {
    mock() {
        return { promisify: jest.fn(a => a) };
    }
};
