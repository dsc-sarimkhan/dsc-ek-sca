module.exports = {
    mock() {
        return jest.fn(() => ({
            use: jest.fn(),
            listen: jest.fn()
        }));
    }
};
